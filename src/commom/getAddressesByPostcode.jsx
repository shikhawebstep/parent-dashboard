export const getAddressesByPostcode = async (postcode) => {
    try {
        // Nominatim API - search by postcode
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(postcode)}&format=json&limit=10&countrycodes=gb`,
            {
                headers: {
                    'Accept': 'application/json',
                }
            }
        );

        const data = await response.json();

        if (!data || data.length === 0) {
            return { 
                success: false, 
                addresses: [], 
                message: "Postcode not found. Try again." 
            };
        }

        // Format addresses nicely
        const addresses = data.map(result => ({
            address: result.address || `${result.name}, ${result.display_name}`,
            fullAddress: result.display_name,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
        }));

        return { 
            success: true, 
            addresses, 
            message: "" 
        };
    } catch (error) {
        console.error("Address lookup error:", error);
        return { 
            success: false, 
            addresses: [], 
            message: "Error fetching addresses. Please try again." 
        };
    }
};