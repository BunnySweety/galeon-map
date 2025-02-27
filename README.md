// File: README.md
# Galeon Hospitals Map

An interactive web application that visualizes the geographical distribution of hospitals through a dynamic map. The application allows you to track the historical deployment of healthcare facilities and explore their characteristics.

## Key Features

- 🗺️ Interactive hospital map with MapBox GL JS
- 📅 Chronological animation showing the progressive deployment of hospitals
- 🔍 Filter by status (deployed, signed)
- 📊 Layer management panel for customized display
- 📍 User geolocation support
- 📤 Data export in Excel, PDF and JSON formats
- 🌍 Multilingual support in English and French

## Technical Stack

- **Framework**: Next.js (SSR, routes API)
- **Mapping**: Mapbox GL JS
- **State Management**: Zustand + TanStack Query
- **Typing**: TypeScript strict
- **Style**: TailwindCSS
- **Validation**: Zod
- **Testing**: Vitest + Playwright
- **Internationalization**: Lingui.js
- **Security**: Helmet.js, Auth.js
- **Monitoring**: Web Vitals, Lighthouse CI

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Mapbox API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/galeon-hospitals-map.git
cd galeon-hospitals-map
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file with your MapBox token
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

```bash
npm run build
npm run start
```

## Internationalization

The application supports both English and French. To extract and compile translation messages:

```bash
# Extract messages
npm run lingui:extract

# Compile messages
npm run lingui:compile
```

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Galeon Community (Autor: BunnySweety)
- Galeon Team