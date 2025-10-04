# FinSense - Personal Finance Management App

FinSense is a comprehensive personal finance management application designed specifically for young adults in India. It automatically tracks expenses through SMS parsing, provides intelligent categorization, and offers personalized financial insights and recommendations.

## 🌟 Features

### Core Features
- **Automatic SMS Parsing**: Extracts transaction data from bank SMS notifications (HDFC, SBI, PhonePe, Google Pay)
- **Smart Categorization**: AI-powered categorization engine with 7 categories (Food, Transport, Shopping, Entertainment, Bills, Transfer, Other)
- **Interactive Dashboard**: Beautiful Material UI dashboard with spending overview, pie charts, and recent transactions
- **Financial Insights**: Personalized spending analysis, trends, and actionable recommendations
- **Budget Management**: Smart budget suggestions based on spending patterns
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Technical Features
- **Firebase Authentication**: Secure user authentication and profile management
- **Real-time Data**: Cloud Firestore for real-time data synchronization
- **Modern UI**: Material-UI components with attractive design
- **TypeScript**: Full type safety and better developer experience
- **Chart Visualizations**: Interactive charts using MUI X Charts

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm
- Firebase project (for authentication and database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/finsense-app.git
   cd finsense-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Cloud Firestore
   - Copy your Firebase config and create `.env` file:
   
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Firebase config:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Getting Started
1. **Sign Up**: Create a new account with email and password
2. **Dashboard**: View your spending overview with mock data
3. **Categories**: Explore different spending categories
4. **Insights**: Get personalized recommendations
5. **Settings**: Customize your preferences and add custom keywords

### SMS Integration (Future Enhancement)
- Grant SMS permissions (mobile app)
- Automatic transaction parsing from bank notifications
- Real-time expense tracking

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Dashboard.tsx     # Main dashboard component
│   ├── TransactionsList.tsx # Transaction list component
│   ├── SpendingInsights.tsx # Insights and recommendations
│   ├── Navigation.tsx    # App navigation
│   └── AuthForm.tsx      # Authentication form
├── pages/               # Page components
│   └── Settings.tsx     # Settings page
├── services/            # Business logic and external services
│   ├── firebase.ts      # Firebase configuration
│   ├── authContext.tsx  # Authentication context
│   └── insightsEngine.ts # Financial insights engine
├── utils/               # Utility functions
│   ├── smsParser.ts     # SMS parsing logic
│   ├── mockDataGenerator.ts # Mock data generation
│   └── categorizationEngine.ts # Transaction categorization
├── types/               # TypeScript type definitions
│   └── index.ts         # App-wide types
└── App.tsx              # Main app component
```

## 🛠️ Technologies Used

- **Frontend**: React 18, TypeScript, Material-UI
- **Backend**: Firebase (Auth + Firestore)
- **Charts**: MUI X Charts
- **Date Handling**: date-fns
- **Build Tool**: Create React App
- **Styling**: Material-UI + CSS-in-JS

## 🎯 Target Problem

**Problem Statement**: Young adults struggle with financial management - 76% of college students feel unprepared to manage money. Traditional finance apps require manual entry and lack personalized insights.

**Solution**: FinSense provides automatic expense tracking through SMS parsing and delivers actionable financial advice tailored to Indian spending patterns.

## 📈 MVP Components

### Must-Have Features ✅
- [x] SMS/Notification Parser for Indian banks
- [x] AI categorization engine with keyword matching
- [x] Dashboard with spending overview and pie charts
- [x] Recent transactions list with attractive UI
- [x] Basic insights and recommendations
- [x] Firebase authentication
- [x] Responsive Material-UI design

### Future Enhancements 🚀
- Mobile app with SMS permissions
- Real-time SMS parsing
- Advanced ML categorization
- Budget alerts and notifications
- Investment tracking
- Bill reminders
- Expense sharing with friends
- Data export features

## 🎨 Design Highlights

- **Modern UI**: Clean, intuitive interface with Material Design
- **Color Coding**: Visual category identification with consistent colors
- **Interactive Charts**: Engaging pie charts and progress bars
- **Responsive Layout**: Optimized for all screen sizes
- **Smooth Animations**: Polished user experience with subtle transitions

## 🔒 Security & Privacy

- **Firebase Auth**: Industry-standard authentication
- **Data Encryption**: All data encrypted at rest and in transit
- **Privacy First**: SMS data processed locally, minimal data collection
- **Secure Storage**: Cloud Firestore with security rules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: FinSense Development Team
- **Design**: Material-UI Design System
- **Backend**: Firebase Platform

## 📞 Support

For support, email support@finsense.app or create an issue in this repository.

---

**FinSense** - Empowering young adults to take control of their financial future! 💰✨