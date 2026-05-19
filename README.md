# Academathon Web Application

A comprehensive tutoring platform that connects students with tutors for personalized learning experiences. Built with Spring Boot and React.

## 🌟 Features

### For Students
- **Find Tutors**: Browse and search for qualified tutors by subject
- **Book Lessons**: Schedule lessons with available tutors
- **Payment Integration**: Secure payment processing via Stripe
- **Reschedule Lessons**: Request lesson reschedules with tutor approval
- **Messaging System**: Direct communication with tutors
- **Lesson History**: Track completed and upcoming lessons
- **Calendar View**: Visualize your lesson schedule
- **Review System**: Rate and review tutors after lessons

### For Tutors
- **Profile Management**: Create and customize tutor profiles
- **Subject Management**: Add subjects and set hourly rates
- **Availability Management**: Set weekly schedules and exceptions
- **Booking Management**: Accept/decline booking requests
- **Reschedule Handling**: Approve or reject reschedule requests
- **Course Content**: Upload and manage course materials
- **Messaging System**: Communicate with students
- **Earnings Dashboard**: Track lesson bookings and revenue

### Platform Features
- **JWT Authentication**: Secure user authentication and authorization
- **Email Notifications**: Automated emails for bookings, confirmations, and updates
- **Payment Retry**: Automatic handling of failed payments
- **Real-time Updates**: Dynamic status updates for bookings
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.4
- **Language**: Java 17+
- **Database**: MySQL 8.0
- **ORM**: Hibernate/JPA
- **Migration**: Flyway
- **Security**: Spring Security with JWT
- **Payment**: Stripe API
- **Email**: Spring Mail
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS3 with modern design
- **Icons**: Font Awesome
- **Payment UI**: Stripe Elements

## 📋 Prerequisites

- **Java**: JDK 17 or higher
- **Node.js**: v16 or higher
- **MySQL**: 8.0 or higher
- **Maven**: 3.6+ (or use included wrapper)
- **Git**: Latest version

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/academathon-software/website.git
cd website
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE academathon;
CREATE USER 'academathon'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON academathon.* TO 'academathon'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend Setup

Navigate to the backend directory:

```bash
cd Backend
```

Configure `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/academathon?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/New_York
spring.datasource.username=academathon
spring.datasource.password=your_password

# JWT Secret (generate a secure random string)
jwt.secret=your_jwt_secret_key_here

# Stripe API Keys
stripe.api.key=sk_test_your_stripe_secret_key
stripe.publishable.key=pk_test_your_stripe_publishable_key

# Email Configuration (Resend SMTP - matches what the app uses in dev & prod)
spring.mail.host=smtp.resend.com
spring.mail.port=587
spring.mail.username=resend
spring.mail.password=${RESEND_API_KEY}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Application URL
app.url=http://localhost:5173
```

Run the backend:

```bash
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

Navigate to the frontend directory:

```bash
cd ../Frontend
```

Install dependencies:

```bash
npm install
```

Update API configuration in `src/services/api.js` if needed:

```javascript
const API_BASE_URL = 'http://localhost:8080';
```

Update Stripe publishable key in `src/components/Payment/PaymentModal.jsx`:

```javascript
const stripePromise = loadStripe('pk_test_your_stripe_publishable_key');
```

Run the frontend:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📚 Database Migrations

Flyway automatically runs migrations on startup. Migration files are located in:
```
Backend/src/main/resources/db/migration/
```

To manually run migrations:
```bash
./mvnw flyway:migrate
```

## 🔑 Environment Variables

### Backend Required Variables
- `spring.datasource.url` - MySQL database URL
- `spring.datasource.username` - Database username
- `spring.datasource.password` - Database password
- `jwt.secret` - JWT signing secret
- `stripe.api.key` - Stripe secret key
- `stripe.publishable.key` - Stripe publishable key
- `spring.mail.username` - Email service username
- `spring.mail.password` - Email service password

### Frontend Configuration
- API endpoint configuration in `src/services/api.js`
- Stripe publishable key in payment components

## 📖 API Documentation

API endpoints are documented in `Backend/API_ENDPOINTS.md`

### Key Endpoints

#### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/verify` - Email verification

#### Bookings
- `GET /api/bookings/user` - Get user bookings
- `POST /api/bookings/create` - Create booking
- `POST /api/bookings/{id}/reschedule` - Request reschedule
- `POST /api/bookings/{id}/accept-reschedule` - Accept reschedule

#### Payments
- `POST /api/payments/create-payment-intent` - Create payment
- `POST /api/payments/webhook` - Stripe webhook handler

#### Messages
- `GET /api/messages/conversations` - Get conversations
- `POST /api/messages/send` - Send message
- `GET /api/messages/conversation/{id}` - Get messages

## 🧪 Testing

### Backend Tests
```bash
cd Backend
./mvnw test
```

### Frontend Tests
```bash
cd Frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd Backend
./mvnw clean package
java -jar target/academathon-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd Frontend
npm run build
# Output will be in the dist/ directory
```

## 🔒 Security Notes

- Never commit sensitive data (API keys, passwords) to version control
- Use environment variables or secure secret management
- Keep JWT secret keys secure and rotate regularly
- Use HTTPS in production
- Enable CORS only for trusted origins
- Validate all user inputs on the backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software owned by Academathon Software.

## 👥 Team

Developed by the Academathon Software Team

## 📧 Contact

For questions or support, please contact the development team.

## 🐛 Known Issues

- Browser cache may need to be cleared after frontend updates
- Ensure MySQL timezone matches application timezone setting

## 🗺️ Roadmap

- [ ] Video call integration for lessons
- [ ] Mobile application (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Automated tutor verification
- [ ] Group lesson support

---

**Version**: 1.0.0  
**Last Updated**: December 2025

