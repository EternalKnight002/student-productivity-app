// src/components/RichTextEditor.tsx
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

type Props = {
  initialHTML?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  onSave?: () => void;
  editorStyle?: object;
  toolbarStyle?: object;
  autoFocus?: boolean;
  onExternalImagePick?: () => Promise<string | null | undefined>;
  externalImageProcessing?: boolean;
};

export type RichTextEditorRef = {
  getHTML: () => Promise<string | null>;
  blur: () => void;
  focus: () => void;
  insertHTML: (html: string) => void;
  insertImage: (uri: string) => void;
};

const RichTextEditor = forwardRef<RichTextEditorRef, Props>((props, ref) => {
  const {
    initialHTML = "",
    placeholder = "Start writing...",
    onChange,
    onSave,
    editorStyle,
    toolbarStyle,
    autoFocus = false,
    onExternalImagePick,
    externalImageProcessing = false,
  } = props;

  const richTextRef = useRef<RichEditor | null>(null);
  const [localProcessing, setLocalProcessing] = useState(false);

  useImperativeHandle(ref, () => ({
    getHTML: async () => {
      if (!richTextRef.current) return null;
      const html = await richTextRef.current.getContentHtml();
      return html;
    },
    blur: () => richTextRef.current?.blurContentEditor(),
    focus: () => richTextRef.current?.focusContentEditor(),
    insertHTML: (html) => richTextRef.current?.insertHTML(html),
    insertImage: (uri: string) => richTextRef.current?.insertImage(uri),
  }));

  // Fallback internal picker (used only when onExternalImagePick isn't provided)
  async function internalPickAndInsertImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission required", "Please allow photo access to attach images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.6,
        base64: false,
        allowsEditing: true,
      });

      if ((result as any).cancelled || (result as any).canceled) return;

      const uri = (result as any).assets?.[0]?.uri ?? (result as any).uri;
      if (!uri) return;

      const filename = uri.split("/").pop();
      const cacheDir = (FileSystem as any).cacheDirectory;
      const dest = `${cacheDir}${filename}`;

      await FileSystem.copyAsync({ from: uri, to: dest });
      richTextRef.current?.insertImage(dest);
    } catch (e) {
      console.warn("Image insert failed (internal)", e);
    }
  }

  // Toolbar handler for image button
  const handleToolbarImagePress = async () => {
    if (onExternalImagePick) {
      try {
        setLocalProcessing(true);
        const pickedUri = await onExternalImagePick();
        setLocalProcessing(false);

        if (!pickedUri) return;

        // Insert placeholder text instead of broken image
        const placeholder = `[Image attached - will display in note view]`;
        richTextRef.current?.insertHTML(
          `<p style="color: #666; font-style: italic; background: #f0f0f0; padding: 8px; border-radius: 4px; margin: 10px 0;">${placeholder}</p>`
        );
        return;
      } catch (err) {
        setLocalProcessing(false);
        console.warn("onExternalImagePick threw an error", err);
      }
    }

    // no external handler, use internal picker
    await internalPickAndInsertImage();
  };

  const handleSave = async () => {
    const html = await richTextRef.current?.getContentHtml();
    onChange?.(html ?? "");
    onSave?.();
  };

  const showProcessing = localProcessing || externalImageProcessing;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      <View style={[styles.editorWrapper, editorStyle]}>
        <RichEditor
          ref={richTextRef}
          initialContentHTML={initialHTML}
          placeholder={placeholder}
          editorStyle={{
            backgroundColor: "transparent",
            cssText: `
              body { 
                font-family: -apple-system, Roboto, 'Segoe UI', sans-serif; 
                padding: 8px; 
              }
              img[src^="file://"] { 
                display: none !important; 
              }
              img[alt=""] {
                display: none !important;
              }
            `,
          }}
          onChange={(html) => onChange?.(html)}
          style={styles.rich}
          useContainer={true}
          initialFocus={autoFocus}
        />

        {showProcessing && (
          <View style={styles.overlay} pointerEvents="box-none">
            <View style={styles.overlayInner}>
              <ActivityIndicator size="small" />
              <Text style={styles.overlayText}>Processing image…</Text>
            </View>
          </View>
        )}
      </View>

      <RichToolbar
        style={[styles.toolbar, toolbarStyle]}
        editor={richTextRef}
        actions={[
          actions.keyboard,
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.insertImage,
          actions.insertLink,
          actions.setStrikethrough,
          actions.undo,
          actions.redo,
        ]}
        iconMap={{
          [actions.insertImage]: ({ tintColor }: { tintColor?: string }) => (
            <Text style={{ color: tintColor ?? "#000", fontSize: 16 }}>🖼️</Text>
          ),
        }}
        insertImage={handleToolbarImagePress}
      />

      {onSave && (
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
});

export default RichTextEditor;

const styles = StyleSheet.create({
  container: { flex: 1 },
  editorWrapper: {
    flex: 1,
    minHeight: 240,
    backgroundColor: "#fff",
  },
  rich: {
    flex: 1,
    minHeight: 200,
    padding: 8,
  },
  toolbar: {
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  actionRow: {
    padding: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#3751FF",
  },
  saveText: { color: "#fff", fontWeight: "600" },

  overlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayInner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    flexDirection: "row",
    alignItems: "center",
  },
  overlayText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#333",
  },
});