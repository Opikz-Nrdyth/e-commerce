import { useParams } from "react-router-dom";
import Navbar from "../components/client/Navbar";
import InvoicePaper from "../components/common/invoicePaper";

const Invoice = ({ categories, userData }) => {
  const params = useParams();
  const invoiceId = params["*"];
  return (
    <>
      <Navbar categories={categories} userData={userData} />
      <div className="container mx-auto p-4 md:p-6 max-w-3xl mt-[95px]">
        <InvoicePaper invoiceId={invoiceId} />
      </div>
    </>
  );
};
export default Invoice;
