import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

function Subscription() {
  const [subscribedChannel, setSubscribedChannel] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribedChannels = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken"); // use accessToken consistently
        if (!token) {
          console.error("Access token not found");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/v1/subscription/u/subscribedChannels`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // attach token
            },
          }
        );

        setSubscribedChannel(response.data.data);
      } catch (error) {
        console.error("Failed to fetch subscribed channels", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedChannels();
  }, []);

  return (
    <div className="subscriptionContainer">
      {loading ? (
        <p>Loading....</p>
      ) : subscribedChannel.length > 0 ? (
        subscribedChannel.map((mySubscribed) => (
          <div key={mySubscribed._id} className="subscribedChannels">
            <div className="subscribedChannelLogo">
              <img
                src={mySubscribed.channel?.avatar || "default-avatar.png"}
                alt={mySubscribed.channel?.userName || "Channel"}
              />
            </div>
            <div className="subscribedChannelDetails">
              <h3>{mySubscribed.channel?.userName}</h3>
              <p>{mySubscribed.channel?.subscribers?.length || 0} Subscribers</p>
            </div>
          </div>
        ))
      ) : (
        <p>No subscribed channels found</p>
      )}
    </div>
  );
}

export default Subscription;
