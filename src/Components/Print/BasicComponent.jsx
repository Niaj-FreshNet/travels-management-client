import * as React from "react";
import { useReactToPrint } from "react-to-print";

import { ComponentToPrint } from "./ComponentToPrint";
import { Button } from "antd";
import { createStyles } from "antd-style";
import { PrinterOutlined } from "@ant-design/icons";

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
        &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
          border-width: 0;
    
          > span {
            position: relative;
          }
    
          &::before {
            content: '';
            background: linear-gradient(135deg, #6253e1, #04befe);
            position: absolute;
            inset: 0;
            opacity: 1;
            transition: all 0.3s;
            border-radius: inherit;
          }
    
          &:hover::before {
            opacity: 0;
          }
        }
      `,
  }));
  

/**
 * A basic printing example printing a component
 */
export const BasicComponent = () => {
    const componentRef = React.useRef(null);
    const { styles } = useStyle();

    const handleAfterPrint = React.useCallback(() => {
        console.log("`onAfterPrint` called");
    }, []);

    const handleBeforePrint = React.useCallback(() => {
        console.log("`onBeforePrint` called");
        return Promise.resolve();
    }, []);

    const printFn = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "AwesomeFileName",
        onAfterPrint: handleAfterPrint,
        onBeforePrint: handleBeforePrint,
    });

    return (
        <div className="w-full">
            <div className="mx-auto p-4">
            <ComponentToPrint ref={componentRef} />
            </div>
            <Button
                onClick={printFn}
                type="primary"
                htmlType="submit"
                className={styles.linearGradientButton}
                icon={<PrinterOutlined />}
                style={{ height: '40px' }}
            >
                Print
            </Button>
            {/* <button onClick={printFn}>Print</button> */}
        </div>
    );
};
