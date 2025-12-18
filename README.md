# Portfolio

A professional portfolio built with Next.js and Tailwind CSS to showcase projects, skills, and technical expertise.

---

## Overview

This portfolio highlights projects, work experience, and technical capabilities with a modern, responsive design. It features a fully functional contact form, project showcase, and fast performance using the latest web technologies.

---

## Features

- **Contact Form**: Validates inputs and sends messages directly via email using Resend API.  
- **Project Showcase**: Displays projects with detailed descriptions and links.  
- **Responsive Design**: Optimized for all screen sizes.  
- **High Performance**: Built with Next.js 16 and Turbopack for fast rendering.

---

## Tech Stack

- **Frontend**: Next.js 16, Tailwind CSS  
- **Backend**: Node.js, Resend API  
- **Utilities**: Axios, React Hooks  
- **Deployment**: Vercel, Netlify (any Next.js 16 compatible platform)

---

## Getting Started

### Prerequisites

- Node.js v20+  
- npm or pnpm  

### Installation

```bash
git clone https://github.com/username/portfolio.git
cd portfolio
npm install
Environment Variables
Create a .env.local file in the root:

ini
Copy code
RESEND_API_KEY=your_resend_api_key
EMAIL_TO=your_email@example.com
EMAIL_FROM=Portfolio <onboarding@resend.dev>
Run Locally
bash
Copy code
npm run dev
Open http://localhost:3000 to view the portfolio.

Project Structure
vbnet
Copy code
/app        - Next.js app directory with pages and components
/public     - Static assets like images and icons
/utils      - Utility functions (e.g., email validation)
Deployment
This portfolio is ready to deploy on any Next.js 16 compatible platform like Vercel or Netlify.

