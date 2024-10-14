import React, { useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import Printer from './Printer';

const PrintSale = ({ saleData, triggerPrint }) => {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      console.log('Preparing to print...');
      console.log('Sale Data:', saleData);
      console.log('Print Ref:', printRef.current);
    },
    onAfterPrint: () => console.log('Print complete.'),
  });

  useEffect(() => {
    if (triggerPrint) {
      handlePrint();
    }
  }, [triggerPrint, handlePrint]);

  return (
    <div style={{ display: 'none' }}>
      <Printer ref={printRef} saleData={saleData} />
    </div>
  );
};

export default PrintSale;
