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
  /**
   * Parent can provide an async function that picks/processes/stores an image
   * and returns the final URI (or null if cancelled). When provided, the editor's
   * toolbar image button will call this instead of the built-in picker.
   */
  onExternalImagePick?: () => Promise<string | null | undefined>;

  /**
   * Parent can pass this boolean to indicate it is running the image flow
   * (so the editor shows the processing overlay while true).
   */
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
        base64: true,
        allowsEditing: true,
      });

      if ((result as any).cancelled || (result as any).canceled) return;

      const { uri, base64 } = result as any;

      if (base64) {
        const ext = uri?.split(".").pop()?.toLowerCase() ?? "jpg";
        const mime = ext === "png" ? "image/png" : "image/jpeg";
        const dataUri = `data:${mime};base64,${base64}`;
        richTextRef.current?.insertImage(dataUri);
        return;
      }

      const filename = uri.split("/").pop();
      // new — cast FileSystem to any for the directory property
        const dest = `${(FileSystem as any).cacheDirectory}${filename}`;

      await FileSystem.copyAsync({ from: uri, to: dest });
      richTextRef.current?.insertImage(dest);
    } catch (e) {
      console.warn("Image insert failed (internal)", e);
    }
  }

  // Toolbar handler for image button: prefer parent's onExternalImagePick if provided.
  const handleToolbarImagePress = async () => {
    if (onExternalImagePick) {
      try {
        setLocalProcessing(true);
        const pickedUri = await onExternalImagePick();
        setLocalProcessing(false);

        if (!pickedUri) return; // cancelled or failed

        // Prefer insertImage API; fallback to HTML img tag if necessary.
        try {
          richTextRef.current?.insertImage(pickedUri);
        } catch {
          richTextRef.current?.insertHTML(
            `<img src="${pickedUri}" style="max-width:100%;height:auto;" />`
          );
        }
        return;
      } catch (err) {
        setLocalProcessing(false);
        console.warn("onExternalImagePick threw an error", err);
        // fall through to internal picker
      }
    }

    // no external handler, use internal picker
    await internalPickAndInsertImage();
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
            cssText: "body { font-family: -apple-system, Roboto, 'Segoe UI', sans-serif; }",
          }}
          onChange={(html) => onChange?.(html)}
          style={styles.rich}
          useContainer={true}
          initialFocus={autoFocus}
        />

        {/* Processing overlay (non-blocking visually) */}
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

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={async () => {
            const html = await richTextRef.current?.getContentHtml();
            props.onChange?.(html ?? "");
            props.onSave?.();
          }}
          style={styles.saveBtn}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
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
