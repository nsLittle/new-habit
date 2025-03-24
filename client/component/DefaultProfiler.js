import React, { useState } from "react";
import { Image } from "react-native";

export default function DefaultProfiler({ uri, style }) {
  const [loadError, setLoadError] = useState(false);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const shouldUseUri = isValidUrl(uri) && !loadError;

  return (
    <Image
      source={shouldUseUri ? { uri } : require("../assets/default-profile.png")}
      style={style}
      onError={() => {
        console.warn("Image load failed. Switching to default.");
        setLoadError(true);
      }}
    />
  );
}
