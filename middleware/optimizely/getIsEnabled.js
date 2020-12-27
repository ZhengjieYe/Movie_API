export const getIsEnabled = (req, key, id, customerId)=>{
  const isEnabled = req.optimizely.client.isFeatureEnabled(
    key,       // Feature key connecting feature to UI
    id,           // String ID used for random percentage-based rollout
    {
      customerId: customerId,   // Attributes used for targeted audience-based rollout
      isVip: true,
    }
  );
  return isEnabled;
}

