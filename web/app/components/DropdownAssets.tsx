"use client";
import { useState, useEffect } from 'react';

interface Asset {
  title: string;
  subtitle: string;
  url: string;
}

interface DropdownAssetsProps {
  assets: Asset[];
  isOpen: boolean;
  hasTransitionEnded: boolean;
}

export default function DropdownAssets({ assets, isOpen, hasTransitionEnded }: DropdownAssetsProps) {
  // Only render assets if dropdown is open AND transition has fully ended
  const shouldShowAssets = isOpen && hasTransitionEnded;

  return (
    <div className="hq-assets-wrapper">
      {shouldShowAssets && assets.map((asset, index) => (
        <div 
          key={index} 
          className="hq-asset-item fade-in-asset"
          style={{ 
            '--asset-delay': `${index * 0.1}s` 
          } as React.CSSProperties}
        >
          <a href={asset.url} className="hq-asset-link">{asset.title}</a>
          <div className="hq-asset-subtitle">{asset.subtitle}</div>
        </div>
      ))}
    </div>
  );
}