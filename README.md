# Healthy Paws
Healthy Paws is a modern web application designed to meet all your pet care needs. Whether you’re searching for grooming, training, or pet sitting services, Healthy Paws has you covered. The platform leverages cutting-edge technologies like Next.js, Firebase, and AI for a seamless user experience.  

## About  
Healthy Paws allows users to:  
- **Search for Services**: Locate grooming, training, and pet sitting/daycare services near your location.  
- **Book Appointments**: Manage service appointments, select a date and time, and book directly through the app.  
- **Manage Pet Profiles**: Create personalized profiles for your pets, including uploading profile pictures.  
- **AI-Driven Assistance**: Use AI to boost your pets profile (e.g., Gemini).  
- **Community Features**: Engage with other pet owners through a planned community forum (future feature).  

## Key Features  
- **Service Locator**: Search and find local pet services using location-based functionality (Google Maps API optional).  
- **Bookings Management**: Full CRUD capabilities for creating, updating, and managing bookings.  
- **Pet Profiles**: Add details about your pet to make all your appointments easier.  
- **AI-Powered Profile Personalization**: Boost your pet's profile with Google's Vision API.  
- **Search Functionality**: Quickly find relevant services at the click of a button.  

## Technologies Used  
- **Framework/Frontend**: Next.js (with TypeScript), React.js, Tailwind CSS
- **Database**: Firebase (Authentication, Firestore, Storage)  
- **AI Integration**: Google Cloud Vision API  
- **Optional Features**: Google Maps API for location-based searches  

## Setup Instructions  
To set up Healthy Paws locally, follow these steps:  

### Prerequisites  
Ensure you have the following installed before proceeding:  
- **Node.js** (v16 or higher)  
- **Firebase** (Set up a Firebase project and enable Firestore & Storage)  
- **Google Cloud Project** (Enable Vision API & Maps API if used)  

### Installation  
- git clone https://github.com/dalamo20/healthyPaws.git
- cd healthyPaws
- npm install

- **.env file** 
NEXT_PUBLIC_FIREBASE_API_KEY=firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=firebase_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=firebase_app_id
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=google_maps_api_key
NEXT_PUBLIC_GOOGLE_VISION_API_KEY=google_vision_api_key
NEXT_PUBLIC_GEMINI_API_KEY=google_gemini_ai_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials_file 

- npm run dev



