import React, { useEffect, useState, useRef } from "react";

const Toast = ({ message, onClose }) => (
  <div className="fixed bottom-5 right-5 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-[slideIn_0.3s_ease-out]">
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div>
      <h4 className="font-bold text-sm">Connection Error</h4>
      <p className="text-sm text-red-100">{message}</p>
    </div>
    <button onClick={onClose} className="ml-4 text-white hover:text-red-200">
      ✕
    </button>
  </div>
);

const IconLocation = ({ className = "w-4 h-4 inline-block mr-1" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="1.5" d="M12 11a3 3 0 100-6 3 3 0 000 6z" />
    <path strokeWidth="1.5" d="M12 21s7-4 7-10a7 7 0 10-14 0c0 6 7 10 7 10z" />
  </svg>
);

const IconIndustry = ({ className = "w-4 h-4 inline-block mr-1" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="1.5" d="M3 21h18M6 21V10l6-4v15M12 7l6 4v10" />
  </svg>
);

const IconPeople = ({ className = "w-4 h-4 inline-block mr-1" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="9" cy="7" r="4" strokeWidth="1.5" />
    <path strokeWidth="1.5" d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
  </svg>
);

const IconExternal = ({ className = "w-4 h-4 inline-block ml-1" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeWidth="1.5" d="M18 13v6H6V6h6" />
    <path strokeWidth="1.5" d="M15 3h6v6" />
    <path strokeWidth="1.5" d="M10 14L21 3" />
  </svg>
);

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-2xl border shadow-sm h-64">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 w-40 mb-4 rounded"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 w-24 mb-2 rounded"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 w-20 mb-2 rounded"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 w-full mb-2 rounded"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 w-2/3 rounded"></div>
    </div>
  );
}

function DetailsModal({ company, onClose }) {
  if (!company) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg shadow-2xl animate-[fadeIn_0.2s_ease-out]">
        <h2 className="text-xl font-bold mb-2 dark:text-white">{company.name}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2 flex items-center">
          <IconIndustry /> {company.industry}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-2 flex items-center">
          <IconLocation /> {company.location}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-3 flex items-center">
          <IconPeople /> {company.employees} Employees
        </p>
        <p className="text-gray-700 dark:text-gray-200 mb-4 leading-relaxed">
          {company.description}
        </p>
        <a href={company.website} target="_blank" className="text-blue-600 dark:text-blue-400 underline inline-flex items-center hover:text-blue-800">
          Visit Website <IconExternal />
        </a>
        <button onClick={onClose} className="block mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* --- STATES --- */
  const [database, setDatabase] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({ search: "", location: "", industry: "" });
  const [sort, setSort] = useState("none");

  const [locations, setLocations] = useState([]);
  const [industries, setIndustries] = useState([]);

  const [visibleCount, setVisibleCount] = useState(9);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const loaderRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const fetchInitialData = async () => {
      setLoading(true);
      let fetchedData = null;

      try {
        const res = await fetch("http://localhost:5000/companies");
        if (res.ok) {
          const data = await res.json();
          fetchedData = Array.isArray(data) ? data : data.companies ?? [];
        }
      } catch (apiErr) {
        console.warn("API connection failed, switching to local JSON...");
      }

      if (!fetchedData) {
        try {
          const res = await fetch("/companies.json");
          if (!res.ok) throw new Error("Failed to load local data");
          
          const data = await res.json();
          fetchedData = Array.isArray(data) ? data : data.companies ?? [];
        } catch (localErr) {
          console.error("Both sources failed", localErr);
          setError("Failed to load data from both API and Local file.");
          setLoading(false);
          return;
        }
      }

      // C. Set State
      if (fetchedData && fetchedData.length > 0) {
        setDatabase(fetchedData);
        setCompanies(fetchedData);

        setLocations([...new Set(fetchedData.map(c => c.location))]);
        setIndustries([...new Set(fetchedData.map(c => c.industry))]);
      } else {
        setError("Data source is empty.");
      }

      setLoading(false);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (database.length === 0) return;

    const applyServerFilters = async () => {
      setLoading(true);
      setVisibleCount(9);

      await new Promise(resolve => setTimeout(resolve, 500));

      let result = [...database];

      if (filters.search) {
        result = result.filter(c => c.name.toLowerCase().includes(filters.search.toLowerCase()));
      }
      if (filters.location) {
        result = result.filter(c => c.location === filters.location);
      }
      if (filters.industry) {
        result = result.filter(c => c.industry === filters.industry);
      }

      if (sort === "az") {
        result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === "za") {
        result.sort((a, b) => b.name.localeCompare(a.name));
      }

      setCompanies(result);
      setLoading(false);
    };

    const timeoutId = setTimeout(() => {
      applyServerFilters();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, sort, database]);

  /* --- INFINITE SCROLL --- */
  useEffect(() => {
    if (loading || visibleCount >= companies.length) return;
    if (!loaderRef.current) return;

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + 6);
          setLoadingMore(false);
        }, 300);
      }
    });

    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [visibleCount, companies.length, loading]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">

      {/* ERROR TOAST */}
      {error && <Toast message={error} onClose={() => setError(null)} />}

      {/* TOP BAR */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Companies<span className="text-blue-600">Directory</span>
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>
      </div>

      {/* HERO + FILTERS */}
      <div className="bg-blue-600 dark:bg-blue-900 pb-24 pt-12 px-4 transition-colors duration-300">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Find Your Next Partner</h2>

          <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-2 transition-all">
            <div className="md:col-span-4">
              <input
                placeholder="Search companies..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full h-12 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full h-12 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">All Locations</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <select
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="w-full h-12 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">All Industries</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="none">Sort By</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CARD GRID */}
      <main className="max-w-6xl mx-auto px-4 -mt-12 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {companies.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-sm text-center transition-colors">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">No companies found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filters.</p>
                <button
                  onClick={() => { setFilters({ search: "", location: "", industry: "" }); setSort("none"); }}
                  className="mt-6 px-6 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.slice(0, visibleCount).map((c, index) => (
                  <div
                    key={`${c.id}-${index}`}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center transition-colors">
                        {c.logo && !c.logo.includes("ui-avatars") ? (
                          <img src={c.logo} alt={c.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">{c.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        {c.industry}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {c.name}
                    </h3>

                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <IconLocation className="w-4 h-4 mr-2 text-gray-400" /> {c.location}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedCompany(c)}
                      className="w-full py-2.5 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:text-blue-400 font-medium rounded-lg transition-all"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* INFINITE SCROLL LOADER */}
            {visibleCount < companies.length && (
              <div ref={loaderRef} className="h-24 flex justify-center items-center mt-8">
                {loadingMore ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Scroll for more</span>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL */}
      {selectedCompany && (
        <DetailsModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}