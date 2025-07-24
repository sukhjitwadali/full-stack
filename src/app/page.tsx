import UserProfile from "@/components/UserProfile";

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the MERN Full-Stack App</h1>
        <p className="text-gray-700 text-lg">This is the home page with proper Tailwind CSS styling.</p>
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Features:</h2>
          <ul className="text-gray-700 space-y-2">
            <li>• User authentication with NextAuth.js</li>
            <li>• MongoDB database integration</li>
            <li>• Responsive design with Tailwind CSS</li>
            <li>• TypeScript for type safety</li>
          </ul>
        </div>
      </div>
      <UserProfile />
    </main>
  );
}