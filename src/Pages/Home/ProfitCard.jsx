import { useRef, useState } from "react";
import { BiShow, BiHide } from "react-icons/bi";
import useProfitSummary from "../../Hooks/useProfitSummary";

const ProfitCard = () => {
    const { data: profitSummary, isLoading } = useProfitSummary();
    const totalProfit = profitSummary?.totalProfit || "Loading";
    const profitOnAir = profitSummary?.profitOnAir || "Loading";

    const [showTotalProfit, setShowTotalProfit] = useState(false);
    const [showProfitOnAir, setShowProfitOnAir] = useState(false);

    const totalProfitTimeoutRef = useRef(null);
    const profitOnAirTimeoutRef = useRef(null);

    const handleShowValue = (showValue, setShowValue, timeoutRef) => {
        if (showValue) {
            clearTimeout(timeoutRef.current);
            setShowValue(false);
        } else {
            setShowValue(true);
            timeoutRef.current = setTimeout(() => {
                setShowValue(false);
            }, 2000);
        }
    };

    // if (isLoading) {
    //     return <div className="p-4 text-center">Loading...</div>;
    // }

    return (
        <div className="border-2 border-white bg-white rounded-xl shadow-lg p-4">
            <div className="">
                <div className="pb-2 px-2">
                    <h2 className="text-xl font-semibold">Profit Margin</h2>
                </div>
                <div className="py-2">
                    <div className="border-2 rounded-md">

                        {/* Total Profit */}
                        <div className="px-3 pt-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <p className="text-md">Total Profit Margin</p>
                                <div className="flex items-center gap-2">
                                    <div className="btn btn-sm btn-success text-xl text-white">
                                        {showTotalProfit ? totalProfit : "****"}
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleShowValue(
                                                showTotalProfit,
                                                setShowTotalProfit,
                                                totalProfitTimeoutRef
                                            )
                                        }
                                        className="text-black text-2xl"
                                    >
                                        {showTotalProfit ? <BiHide /> : <BiShow />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="divider my-1"></div>

                        {/* Profit on Air */}
                        <div className="px-3 pb-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <p className="text-md">Profit on Air</p>
                                <div className="flex items-center gap-2">
                                    <div className="btn btn-sm btn-error text-xl text-white">
                                        {showProfitOnAir ? profitOnAir : "****"}
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleShowValue(
                                                showProfitOnAir,
                                                setShowProfitOnAir,
                                                profitOnAirTimeoutRef
                                            )
                                        }
                                        className="text-black text-2xl"
                                    >
                                        {showProfitOnAir ? <BiHide /> : <BiShow />}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitCard;
