import React from 'react';
import { Grid } from 'react-loader-spinner';
import '../../styles/LoadingComponent.css';

const LoadingComponent = () => (
    <div className="loading-container">
        <Grid color="#ff6347" height={80} width={80} />
    </div>
);

export default LoadingComponent;
