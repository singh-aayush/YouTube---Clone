import { useEffect, useState } from "react";
import axios from "axios";

function Subscription() {
  const [subscribedChannel, setSubscribedChannel] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribedChannels = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `/api/v1/subscription/u/subscribedChannels`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log("Fetched channels:", response.data.data); // Check the structure here
        // console.log("subs", response.data.data.channel);
        setSubscribedChannel(response.data.data);
      } catch (error) {
        console.log("Failed to fetch subscribed channels", error);
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
          <div className="subscribedChannels">
            <div className="subscribedChannelLogo">
              <img
                src={mySubscribed.channel?.avatar}
                alt={mySubscribed.channel?.userName}
              />
            </div>
            <div className="subscribedChannelDetails">
              {/* <h3>{mySubscribed.channel.userName}</h3>
              <p>{mySubscribed.channel.subscribers} Subscribers</p> */}
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
