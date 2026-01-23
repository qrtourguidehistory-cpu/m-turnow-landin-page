export default function PayPalCancel() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>
          Pago cancelado
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Puedes cerrar esta ventana
        </p>
      </div>
    </div>
  );
}

