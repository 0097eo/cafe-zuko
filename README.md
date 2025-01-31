# Coffee Bean Marketplace

A full-stack e-commerce platform built with React and Django that connects coffee vendors with customers, enabling seamless buying and selling of coffee beans.

## Features

### For Vendors
- Vendor profile management
- Product listing management with customizable templates
- Inventory tracking and updates
- Order management dashboard

### For Customers
- User profile creation and management
- Product browsing with advanced filtering
- Shopping cart functionality
- Secure checkout process
- Order history and tracking

### Core Functionality
- Responsive design for all devices
- Advanced search with filters
- User authentication and authorization
- Secure payment processing
- Real-time inventory updates

## Tech Stack

### Frontend
- React.js
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Jest/React Testing Library for testing

### Backend
- Django
- Django REST Framework
- PostgreSQL database
- Django built-in testing suite

### Payment Integration
- Daraja 2.0 integration
- Secure transaction processing
- Payment status tracking

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/0097e0/cafe-zuko.git
cd coffee-marketplace
```

2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

4. Database Setup
```bash
createdb coffee_marketplace
python manage.py makemigrations
python manage.py migrate
```

## Development

### Running Tests
Frontend:
```bash
cd frontend
npm test
```

Backend:
```bash
cd backend
python manage.py test
```

### Code Style
- Frontend: ESLint and Prettier
- Backend: Black formatter and flake8



## Security Considerations
- HTTPS enabled by default
- Secure session management
- XSS protection
- CSRF protection
- Rate limiting
- Input validation
- Secure password hashing


## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
