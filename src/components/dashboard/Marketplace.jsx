import React, { useState, useEffect } from 'react';
import PropertyDetail from './PropertyDetail';

/**
 * MARKETPLACE TAB
 * Browse verified properties - Works with localStorage
 */
const Marketplace = ({ user }) => {
    const [view, setView] = useState('list');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [properties, setProperties] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ search: '', propertyType: '', minPrice: '', maxPrice: '' });

    useEffect(() => {
        loadListings();
    }, []);

    const loadListings = () => {
        // Load from localStorage
        const saved = localStorage.getItem('bhoomiai_marketplace');
        if (saved) {
            try {
                setProperties(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load marketplace listings');
            }
        }
    };

    const handleViewProperty = (property) => {
        setSelectedProperty(property);
        setView('detail');
    };

    const filteredProperties = properties.filter(p => {
        if (filters.search && !p.propertyAddress.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.propertyType && p.landType !== filters.propertyType) return false;
        if (filters.minPrice && p.price < parseFloat(filters.minPrice)) return false;
        if (filters.maxPrice && p.price > parseFloat(filters.maxPrice)) return false;
        return true;
    });

    const getRiskBadge = (level) => {
        const colors = { low: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-red-100 text-red-700' };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[level] || 'bg-gray-100'}`}>{level} risk</span>;
    };

    if (view === 'detail' && selectedProperty) {
        return (
            <div>
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    ← Back to Listings
                </button>
                <PropertyDetail property={selectedProperty} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Marketplace</h1>
                    <p className="text-sm text-gray-600">Browse verified properties</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="sm:hidden flex items-center gap-2 px-4 py-2 border rounded-lg"
                >
                    Filters {showFilters ? '▲' : '▼'}
                </button>
            </div>

            {/* Filters */}
            <div className={`bg-white rounded-xl border p-4 mb-6 ${showFilters ? '' : 'hidden sm:block'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search location..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                    />
                    <select
                        value={filters.propertyType}
                        onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="">All Types</option>
                        <option value="agricultural">Agricultural</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                    />
                    <input
                        type="number"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                    />
                </div>
            </div>

            {/* Listings */}
            {filteredProperties.length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">🏠</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-500">Properties listed from verification will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProperties.map((p) => (
                        <div key={p.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                <span className="text-5xl">🏡</span>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900 text-sm">{p.propertyAddress}</h3>
                                    {getRiskBadge(p.riskLevel)}
                                </div>
                                <p className="text-lg font-bold text-primary-600 mb-2">₹{(p.price || 0).toLocaleString()}</p>
                                <p className="text-sm text-gray-500 mb-3">{p.area} sq.ft • {p.landType}</p>
                                <button
                                    onClick={() => handleViewProperty(p)}
                                    className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 text-sm font-medium"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
