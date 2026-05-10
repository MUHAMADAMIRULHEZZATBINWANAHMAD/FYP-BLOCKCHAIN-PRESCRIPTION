import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

export default function Mint() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  // Form states for attributes
  const [color, setColor] = useState("");
  const [country, setCountry] = useState("");
  const [value, setValue] = useState(""); 
  
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Build the attributes array for Pinata metadata
    const attributes = [
      { trait_type: "Color", value: color },
      { trait_type: "Country", value: country },
      { trait_type: "Value", value: value },
    ];

    formData.append("attributes", JSON.stringify(attributes));

    try {
      const res = await fetch("http://localhost:3001/mint", {
        method: "POST",
        body: formData,
        // No Authorization headers needed since we removed Auth for the Admin side here
      });

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      console.error("Minting request failed:", err);
      setResponse({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ padding: "20px", position: "relative" }}>
        <div style={{ position: "absolute", top: 20, right: 20 }}>
          <button type="button" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </div>
      </div>
      <h1>Create New Shirt Listing (Admin)</h1>
      <p>Fill out this form to upload the shirt to Pinata and lazy-mint it to the blockchain Store.</p>
      
      <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        <div>
          <label>Shirt Name:</label><br />
          <input name="name" type="text" required style={{ width: '100%' }} />
        </div>

        <div>
          <label>Description:</label><br />
          <textarea name="description" required style={{ width: '100%', height: '80px' }} />
        </div>

        <div>
          <label>Total Supply (How many shirts available?):</label><br />
          <input name="supply" type="number" defaultValue="100" required style={{ width: '100%' }} />
        </div>

        <div>
          <label>Price (in ETH):</label><br />
          {/* Defaulting to 0.011 ETH as discussed previously */}
          <input name="price" type="number" step="0.0001" defaultValue="0.011" required style={{ width: '100%' }} />
        </div>

        {/* Attribute field for Color trait */}
        <div>
          <label>Color:</label><br />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        {/* Attribute field for Manufacturing Country trait */}
        <div>
          <label>Manufacturing Country:</label><br />
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        {/* Attribute field for Value trait */}
        <div>
          <label>Value (e.g., Premium, Standard):</label><br />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label>Shirt Image (Uploaded to Pinata IPFS):</label><br />
          <input type="file" name="image" accept="image/*" required />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px', marginTop: '10px' }}>
          {loading ? "Processing (Uploading to Pinata & Blockchain)..." : "Create Listing"}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: "30px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
          {response.success ? (
            <>
              <h2 style={{ color: "green" }}>✅ Listing Created Successfully!</h2>
              
              <p><strong>Metadata IPFS URI:</strong> <br/>
                <a href={response.metadataUri.replace("ipfs://", "https://ipfs.io/ipfs/")} target="_blank" rel="noopener noreferrer">
                  {response.metadataUri}
                </a>
              </p>
              
              <p><strong>Blockchain Tx Hash (Lazy Mint):</strong> <br/>
                {response.lazyMintHash ? (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${response.lazyMintHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {response.lazyMintHash}
                  </a>
                ) : "Not available"}
              </p>

              {/* QR code generation for the Metadata URI */}
              <div style={{ marginTop: "20px" }}>
                <p><strong>Scan QR to view Metadata:</strong></p>
                <div style={{ background: "white", padding: "10px", display: "inline-block" }}>
                  <QRCodeSVG
                    value={response.metadataUri.replace("ipfs://", "https://ipfs.io/ipfs/")}
                    size={180}
                  />
                </div>
                <div style={{ marginTop: "15px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(response.metadataUri.replace("ipfs://", "https://ipfs.io/ipfs/"));
                      alert("Metadata URL copied to clipboard!");
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#007bff",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Copy Metadata URL
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: "red" }}>❌ Error: {response.error}</p>
          )}
        </div>
      )}
    </div>
  );
}