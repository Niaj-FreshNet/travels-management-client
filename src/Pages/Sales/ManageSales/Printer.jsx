import React from 'react';
import dayjs from 'dayjs';

const Printer = React.forwardRef((props, ref) => {
  const { saleData } = props;

  if (!saleData) {
    return <div>No sale data available for printing.</div>; // Handle undefined saleData
  }

//   console.log('Printer SaleData:', saleData); // For debugging

  return (
    <div ref={ref}>
      <h1>Sale Report</h1>
      <p><strong>Sale ID:</strong> {saleData._id || 'N/A'}</p>
      <p><strong>Mode:</strong> {saleData.mode || 'N/A'}</p>
      <p><strong>Date:</strong> {saleData.date ? dayjs(saleData.date).format('YYYY-MM-DD') : 'N/A'}</p>
      <h2>Details</h2>
      <p><strong>Sell By:</strong> {saleData.sellBy || 'N/A'}</p>
      {/* If you had an array of items, render them here */}
      <h2>Items</h2>
      {saleData.items && saleData.items.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Airline Code</th>
              <th>Supplier Name</th>
              <th>Sell Price</th>
              <th>Buying Price</th>
              <th>Remarks</th>
              <th>Passenger Name</th>
              <th>Sector</th>
            </tr>
          </thead>
          <tbody>
            {saleData.items.map((item, index) => (
              <tr key={index}>
                <td>{item.airlineCode || 'N/A'}</td>
                <td>{item.supplierName || 'N/A'}</td>
                <td>{item.sellPrice || 'N/A'}</td>
                <td>{item.buyingPrice || 'N/A'}</td>
                <td>{item.remarks || 'N/A'}</td>
                <td>{item.passengerName || 'N/A'}</td>
                <td>{item.sector || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No items available for this sale.</p>
      )}
    </div>
  );
});

export default Printer;
