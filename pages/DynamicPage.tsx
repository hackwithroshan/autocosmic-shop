
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ContentPage } from '../types';

interface DynamicPageProps {
  user: any;
  logout: () => void;
}

const DynamicPage: React.FC<DynamicPageProps> = ({ user, logout }) => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/pages/${slug}`);
        if (!response.ok) {
            if (response.status === 404) throw new Error('Page not found');
            throw new Error('Failed to fetch page');
        }
        const data = await response.json();
        setPage(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
        fetchPage();
    }
  }, [slug]);

  if (loading) {
      return (
          <div className="flex flex-col min-h-screen bg-white">
              <Header user={user} logout={logout} />
              <main className="flex-grow container mx-auto px-4 py-12 flex justify-center">
                  <div className="animate-pulse flex flex-col items-center w-full max-w-2xl">
                      <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                  </div>
              </main>
              <Footer />
          </div>
      );
  }

  if (error || !page) {
      return (
          <div className="flex flex-col min-h-screen bg-white">
              <Header user={user} logout={logout} />
              <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
                  <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">The page you are looking for does not exist or has been moved.</p>
                  <Link to="/" className="px-6 py-3 bg-rose-600 text-white rounded-md font-medium hover:bg-rose-700 transition-colors">
                      Return Home
                  </Link>
              </main>
              <Footer />
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header user={user} logout={logout} />
      
      <main className="flex-grow">
          {/* Page Header */}
          <div className="bg-gray-50 border-b border-gray-100">
              <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">{page.title}</h1>
                  <div className="w-16 h-1 bg-rose-500 mx-auto mt-6"></div>
              </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-12">
              <div className="max-w-3xl mx-auto prose prose-rose prose-lg text-gray-700">
                  {/* Safe HTML Rendering */}
                  <div dangerouslySetInnerHTML={{ __html: page.content }} />
              </div>
          </div>
      </main>

      <Footer />
    </div>
  );
};

export default DynamicPage;
