export const getAddressesByPostcode = async (postcode) => {
    const API_KEY = import.meta.env.VITE_IDEAL_POSTCODES_API_KEY;

    try {
        const response = await fetch(
            `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(postcode)}?api_key=${API_KEY}`
        );
        const data = await response.json();

        if (response.status === 404 || !data?.result?.length) {
            return {
                success: false,
                addresses: [],
                message: data?.result?.length === 0
                    ? "No addresses found for this postcode."
                    : "Postcode not found.",
            };
        }

        if (data.code !== 2000) {
            return {
                success: false,
                addresses: [],
                message: data?.message || "Error fetching postcode details.",
            };
        }

        const addresses = data.result.map((item) => {
            const formatted = [item.line_1, item.line_2, item.line_3, item.post_town]
                .filter(Boolean)
                .join(", ");
            return {
                address: formatted,            // ← what addressOptions filters/maps on
                line1: item.line_1,
                line2: item.line_2,
                buildingNumber: item.building_number,
                line3: item.line_3,
                city: item.post_town,
                postcode: item.postcode,
                udprn: item.udprn,             // unique premise reference, handy to store
            };
        });

        return { success: true, addresses, message: "" };
    } catch (error) {
        console.error("Address lookup error:", error);
        return {
            success: false,
            addresses: [],
            message: "Error fetching postcode details.",
        };
    }
};