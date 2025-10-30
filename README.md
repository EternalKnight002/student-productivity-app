# Student Planner App

A lightweight, cross-platform productivity application built with React Native and Expo. Designed for students to manage their daily tasks, track expenses, take notes, and visualize their spending habits—all in one place.

## Features

### 📊 Analytics & Expenses
- Track spending across categories (Food, Transport, College, Books, Snacks, and more)
- View spending trends with interactive line charts
- Filter expenses by time range (7 days, 30 days, all-time)
- Category breakdown with percentage distribution
- Export/import expenses as JSON for backup and sharing
- Archive expenses for organization
- Swipe-to-delete with undo functionality

### 📝 Notes
- Create and edit rich-text notes with formatting options
- Attach and organize images within notes
- Image compression and local storage management
- View notes in gallery format with previews
- Delete notes with confirmation

### 📅 Planner
- Create tasks with due dates, priorities, and course tags
- Filter tasks (All, Upcoming, Overdue, Done)
- Mark tasks as complete with visual feedback
- Swipe-to-delete with smooth animations
- Haptic feedback for interactions
- Edit and manage task details

### 🎨 Theme & Customization
- Light and dark mode support (coming in future update)
- Customizable accent colors (coming in future update)
- Responsive design for phones and tablets
- Beautiful gradient-based UI components

### 📱 UI/UX
- Smooth animations and transitions
- Gesture-based interactions (swipe actions)
- Interactive feature cards on home screen
- Bottom navigation bar with active state indicators
- Animated drawer menu with profile section
- Safe area handling for all devices

## Tech Stack

- **Framework**: React Native with Expo
- **State Management**: Zustand with AsyncStorage persistence
- **Navigation**: Expo Router (file-based routing)
- **UI Components**: React Native core components + custom components
- **Rich Text Editing**: react-native-pell-rich-editor
- **Charts**: react-native-chart-kit
- **Icons**: Feather & Material Community Icons
- **Animations**: React Native Reanimated
- **Forms**: React Hook Form
- **Storage**: AsyncStorage, Expo FileSystem
- **Language**: TypeScript

## Project Structure

```
├── app/                           # Screens and routes (Expo Router)
│   ├── index.tsx                  # Home screen
│   ├── _layout.tsx                # Root layout with drawer navigation
│   ├── analytics/                 # Expenses analytics screens
│   ├── expenses/                  # Expense management screens
│   ├── notes/                     # Notes creation and viewing
│   ├── planner/                   # Task planner screens
│   ├── settings.tsx               # Settings and data management
│   ├── help/                      # Help & feedback screen
│   └── about/                     # About screen
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── Chip.tsx
│   │   ├── ExpenseItem.tsx
│   │   ├── NoteItem.tsx
│   │   ├── RichTextEditor.tsx
│   │   ├── TaskItem.tsx
│   │   └── ...more components
│   ├── stores/                    # Zustand stores for state management
│   │   ├── useExpenseStore.tsx
│   │   ├── useNotesStore.ts
│   │   ├── useTaskStore.tsx
│   │   └── useThemeStore.ts
│   ├── theme/                     # Theme configuration and provider
│   ├── types/                     # TypeScript type definitions
│   │   ├── expense.ts
│   │   ├── note.ts
│   │   └── task.ts
│   ├── utils/                     # Utility functions
│   │   ├── analytics.ts
│   │   └── formatters.ts
│   └── services/                  # Storage and cleanup services
├── package.json
├── tsconfig.json
├── babel.config.js
├── eas.json                       # EAS build configuration
└── app.json                       # Expo configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go app on device)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd student-productivity-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
expo start
```

4. Open in Expo Go or emulator:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on device

## Usage

### Expenses
1. Navigate to **Expenses** from the home screen or bottom nav
2. Tap the **+** FAB to add a new expense
3. Fill in amount, category, date, and optional note
4. View analytics and spending trends in the **Analytics** tab
5. Swipe left to delete or right to archive expenses

### Notes
1. Go to **Notes** from the menu
2. Tap **Create Note** or the FAB
3. Add a title and use the rich text editor for formatting
4. Attach images using the toolbar
5. Save to persist locally

### Planner
1. Access **Planner** from navigation
2. Create tasks with due dates and priorities
3. Filter by status (All, Upcoming, Overdue, Done)
4. Tap checkbox to mark complete
5. Swipe to delete tasks

### Settings
- Export expenses as JSON backup
- Import previously exported JSON
- Clear all data
- Access help and feedback
- View app information

## Data Persistence

All data is stored locally using AsyncStorage:
- **Expenses**: `expenses-storage-v1`
- **Notes**: `notes` (with image attachment file system storage)
- **Tasks**: `task-store-v1`
- **Theme**: `student_theme_v1`

Data is encrypted and never sent to external servers.

## Customization

### Theming
Edit `src/theme.ts` or `src/theme/ThemeProvider.tsx` to customize:
- Color palette
- Typography sizes
- Spacing tokens
- Border radius values

### Categories
Modify category lists in respective screens:
- Expenses: `app/expenses/add.tsx` (CATEGORIES array)
- Customize colors in `src/components/ExpenseItem.tsx`

## Building for Production

### EAS Build (Recommended)

1. Configure EAS project:
```bash
eas build:configure
```

2. Build for iOS/Android:
```bash
eas build --platform ios
eas build --platform android
```

3. Submit to App Store/Play Store:
```bash
eas submit --platform ios
eas submit --platform android
```

### Local Build
Refer to [Expo Build Documentation](https://docs.expo.dev/build/setup/)

## Performance Optimizations

- Memoized components and hooks to prevent unnecessary re-renders
- Lazy-loaded screens with Expo Router
- Image compression for attachments
- Debounced analytics calculations
- Efficient list rendering with FlatList

## Known Limitations

- Dark mode controls are present but not fully functional (coming in future update)
- Accent color customization UI is disabled (coming in future update)
- Offline-first only (no cloud sync)
- Limited notification support

## Future Enhancements

- [ ] Full dark mode implementation
- [ ] Accent color customization
- [ ] Cloud backup and sync
- [ ] Push notifications for task reminders
- [ ] Budget alerts
- [ ] Recurring expenses
- [ ] Collaborative notes
- [ ] Advanced analytics and reports

## Troubleshooting

### App won't start
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 18+)

### Storage not persisting
- Ensure AsyncStorage is properly initialized
- Check device storage space
- Clear app cache and try again

### Images not displaying
- Check FileSystem permissions (iOS/Android)
- Verify image was properly saved to cache directory
- Check image file format (JPEG/PNG)

### Build errors
- Clear metro bundler cache: `expo start --clear`
- Check for TypeScript errors: `tsc --noEmit`
- Verify all dependencies are installed

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Create a feature branch (`git checkout -b feature/your-feature`)
2. Commit with clear messages
3. Push to branch and create a Pull Request
4. Ensure code follows existing style and TypeScript conventions

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

### Apache License 2.0 Summary
- ✅ You can use, modify, and distribute this software
- ✅ You can use it for commercial purposes
- ✅ Patent protection is included
- ⚠️ You must include a copy of the license and a notice of changes
- ⚠️ No warranty is provided

For the full license text, see: https://www.apache.org/licenses/LICENSE-2.0

## Support

For issues, feature requests, or feedback:
- Email: alternatewavelenght@gmail.com
- Use the in-app Help & Feedback feature

## Acknowledgments

- Built with [Expo](https://expo.dev)
- Icons from [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- State management with [Zustand](https://github.com/pmndrs/zustand)
- Rich text editing with [react-native-pell-rich-editor](https://github.com/enesozmus/react-native-pell-rich-editor)