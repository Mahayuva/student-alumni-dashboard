"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function AlumniMap() {
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNearMe, setShowNearMe] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        fetchMapData();
        // Get current user location for "Near Me" feature
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => console.error("Error getting location:", error)
            );
        }
    }, []);

    useEffect(() => {
        if (showNearMe && userLocation) {
            // Filter users within ~500km (approximate)
            const nearby = users.filter(u => {
                if (!u.profile?.latitude || !u.profile?.longitude) return false;
                const distance = calculateDistance(
                    userLocation[0], userLocation[1],
                    u.profile.latitude, u.profile.longitude
                );
                return distance < 500; // 500km radius
            });
            setFilteredUsers(nearby);
        } else {
            setFilteredUsers(users);
        }
    }, [showNearMe, users, userLocation]);

    const fetchMapData = async () => {
        try {
            const res = await fetch("/api/student/map");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
                setFilteredUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch map data", error);
        } finally {
            setLoading(false);
        }
    };

    // Haversine formula to calculate distance in km
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={() => setShowNearMe(!showNearMe)}
                    disabled={!userLocation}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showNearMe
                        ? "bg-primary text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                        }`}
                >
                    {showNearMe ? "Show All" : "Show Near Me (< 500km)"}
                </button>
            </div>

            <div className="h-[600px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0 relative">
                <MapContainer center={[20, 78] as L.LatLngExpression} zoom={3} scrollWheelZoom={true} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredUsers.map((user) => (
                        <Marker
                            key={user.id}
                            position={[user.profile.latitude, user.profile.longitude] as L.LatLngExpression}
                            icon={icon}
                        >
                            <Popup>
                                <div className="p-2 min-w-[150px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-sm text-slate-900 leading-tight">{user.name}</h3>
                                            <span className="text-[10px] uppercase font-bold text-primary">{user.role}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600 mb-1">{user.profile?.headline}</p>
                                    <p className="text-xs text-slate-500 font-medium mb-3">
                                        {user.profile?.city ? `${user.profile.city}` : "Location"}
                                    </p>
                                    <button
                                        onClick={() => window.open(`mailto:${user.email}`)}
                                        className="w-full bg-primary hover:bg-black text-white text-[10px] font-bold py-1.5 px-3 rounded-md transition-colors shadow-sm flex items-center justify-center gap-1"
                                    >
                                        Connect & View Profile
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Show current user location if available */}
                    {userLocation && (
                        <Marker position={userLocation as L.LatLngExpression} icon={icon}>
                            <Popup>You are here</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}
