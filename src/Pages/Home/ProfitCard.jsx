import { BiLinkExternal } from "react-icons/bi";
import useAirlines from "../../Hooks/useAirlines";
import useSuppliers from "../../Hooks/useSuppliers";
import { NavLink } from "react-router-dom";

const ProfitCard = () => {
    const { airlines } = useAirlines();
    const { suppliers } = useSuppliers();


    return (
        <div className="border-2 border-white rounded-xl shadow-lg p-4">
            <div className="">
                <div className="pb-2 px-2">
                    <h2 className="text-xl font-semibold">Profit Margin</h2>
                </div>
                <div className="py-2">
                    <div className="border-2 rounded-md">
                        <div className="px-3 pt-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <p className="text-md">Total Profit Margin</p>
                                <div className="flex items-center gap-2">
                                    <div className="badge badge-lg badge-info text-white">...</div>
                                    <NavLink to="/airlines" >
                                        <div className="btn btn-outline btn-sm bg-gray">
                                            <BiLinkExternal size={20} />
                                        </div>
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="px-3 pb-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <p className="text-md">Profit on Air</p>
                                <div className="flex items-center gap-2">
                                    <div className="badge badge-lg badge-success text-white">...</div>
                                    <NavLink to="/suppliers" >
                                        <div className="btn btn-outline btn-sm bg-gray">
                                            <BiLinkExternal size={20} />
                                        </div>
                                    </NavLink>
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