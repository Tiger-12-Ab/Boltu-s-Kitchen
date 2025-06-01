import ReviewsDashboard from "../components/ReviewsDashboard";
import ProfileDashboard from "../components/ProfileDashboard";
import OrderHistoryDashboard from "../components/OrderHistoryDashboard";

export default function Dashboard() {
  

  return (
    <>
      <ProfileDashboard />
      <OrderHistoryDashboard />
      <ReviewsDashboard />
    </>
  );
}
