export default async function handler(req, res) {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: "No se proporcionó ninguna URL" });
    }

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();

        // Configuramos los encabezados para permitir el paso de datos a tu PWA
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Error al conectar con el servidor IPTV" });
    }
}
