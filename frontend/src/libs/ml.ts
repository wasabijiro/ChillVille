// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchMLInference = async (discordScore: number, stats : any) => {
  console.log({ stats });
  try {
    console.log("Reloading");
    const response = await fetch('http://localhost:5001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discord_score: discordScore,
        biometric: Number(stats[0].stat || 0),
        wallet_score: Number(stats[1].stat || 0),
        screen_pressure_score: Number(stats[2].stat || 0),
        acceleration_score: Number(stats[3].stat || 0),
        ride_score: Number(stats[4].stat || 0),
      })
    });

    const { prediction } = await response.json();
    console.log({ prediction });
    return prediction;
  } catch (error) {
    console.error("Error reloading credit score:", error);
    return null;
  }
};
