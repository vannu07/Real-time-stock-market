import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib
import logging
from datetime import datetime, timedelta
import os

logger = logging.getLogger(__name__)

class LSTMPredictor:
    """Advanced LSTM model for stock price prediction"""
    
    def __init__(self, sequence_length=60, features=['close', 'volume', 'sentiment']):
        self.sequence_length = sequence_length
        self.features = features
        self.scaler = MinMaxScaler()
        self.model = None
        self.is_trained = False
        self.model_path = 'models/lstm_model.h5'
        self.scaler_path = 'models/lstm_scaler.pkl'
        
        # Create models directory
        os.makedirs('models', exist_ok=True)
    
    def prepare_data(self, data, target_column='close'):
        """Prepare data for LSTM training"""
        try:
            # Ensure data is sorted by date
            data = data.sort_index()
            
            # Select features
            feature_data = data[self.features].values
            
            # Scale the data
            scaled_data = self.scaler.fit_transform(feature_data)
            
            # Create sequences
            X, y = [], []
            for i in range(self.sequence_length, len(scaled_data)):
                X.append(scaled_data[i-self.sequence_length:i])
                y.append(scaled_data[i, 0])  # Assuming first column is target
            
            return np.array(X), np.array(y)
            
        except Exception as e:
            logger.error(f"Error preparing data: {e}")
            return None, None
    
    def build_model(self, input_shape):
        """Build advanced LSTM model"""
        model = Sequential([
            # First LSTM layer
            LSTM(50, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            BatchNormalization(),
            
            # Second LSTM layer
            LSTM(50, return_sequences=True),
            Dropout(0.2),
            BatchNormalization(),
            
            # Third LSTM layer
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            BatchNormalization(),
            
            # Dense layers
            Dense(25, activation='relu'),
            Dropout(0.1),
            Dense(1)
        ])
        
        # Compile model
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def train(self, data, validation_split=0.2, epochs=100, batch_size=32):
        """Train the LSTM model"""
        try:
            logger.info("Preparing training data...")
            X, y = self.prepare_data(data)
            
            if X is None or y is None:
                logger.error("Failed to prepare training data")
                return False
            
            # Build model
            logger.info("Building LSTM model...")
            self.model = self.build_model((X.shape[1], X.shape[2]))
            
            # Callbacks
            callbacks = [
                EarlyStopping(patience=15, restore_best_weights=True),
                ReduceLROnPlateau(patience=10, factor=0.5, min_lr=0.0001)
            ]
            
            # Train model
            logger.info("Training LSTM model...")
            history = self.model.fit(
                X, y,
                validation_split=validation_split,
                epochs=epochs,
                batch_size=batch_size,
                callbacks=callbacks,
                verbose=1
            )
            
            # Save model and scaler
            self.model.save(self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            
            self.is_trained = True
            logger.info("LSTM model trained successfully")
            
            return True
            
        except Exception as e:
            logger.error(f"Error training LSTM model: {e}")
            return False
    
    def load_model(self):
        """Load pre-trained model"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = tf.keras.models.load_model(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.is_trained = True
                logger.info("LSTM model loaded successfully")
                return True
            else:
                logger.warning("No pre-trained LSTM model found")
                return False
        except Exception as e:
            logger.error(f"Error loading LSTM model: {e}")
            return False
    
    def predict(self, data, days_ahead=1):
        """Make predictions"""
        try:
            if not self.is_trained:
                if not self.load_model():
                    logger.error("No trained model available")
                    return None
            
            # Prepare input data
            if len(data) < self.sequence_length:
                logger.error(f"Need at least {self.sequence_length} data points")
                return None
            
            # Get last sequence
            feature_data = data[self.features].tail(self.sequence_length).values
            scaled_data = self.scaler.transform(feature_data)
            
            predictions = []
            current_sequence = scaled_data.reshape(1, self.sequence_length, len(self.features))
            
            for _ in range(days_ahead):
                # Predict next value
                pred = self.model.predict(current_sequence, verbose=0)
                predictions.append(pred[0, 0])
                
                # Update sequence for next prediction
                new_row = np.zeros((1, len(self.features)))
                new_row[0, 0] = pred[0, 0]  # Use prediction as next close price
                new_row[0, 1:] = current_sequence[0, -1, 1:]  # Keep other features
                
                current_sequence = np.append(
                    current_sequence[:, 1:, :],
                    new_row.reshape(1, 1, len(self.features)),
                    axis=1
                )
            
            # Inverse transform predictions
            dummy_data = np.zeros((len(predictions), len(self.features)))
            dummy_data[:, 0] = predictions
            predictions_scaled = self.scaler.inverse_transform(dummy_data)[:, 0]
            
            return predictions_scaled
            
        except Exception as e:
            logger.error(f"Error making LSTM predictions: {e}")
            return None
    
    def evaluate(self, test_data):
        """Evaluate model performance"""
        try:
            X_test, y_test = self.prepare_data(test_data)
            
            if X_test is None or y_test is None:
                return None
            
            predictions = self.model.predict(X_test)
            
            # Calculate metrics
            mse = mean_squared_error(y_test, predictions)
            mae = mean_absolute_error(y_test, predictions)
            rmse = np.sqrt(mse)
            
            return {
                'mse': float(mse),
                'mae': float(mae),
                'rmse': float(rmse)
            }
            
        except Exception as e:
            logger.error(f"Error evaluating LSTM model: {e}")
            return None
    
    def get_feature_importance(self):
        """Get feature importance (approximation for LSTM)"""
        if not self.is_trained:
            return None
        
        # This is a simplified approach - in practice, you'd use more sophisticated methods
        importance = {}
        for i, feature in enumerate(self.features):
            # Weight importance based on feature position and model complexity
            importance[feature] = np.random.uniform(0.1, 1.0)  # Placeholder
        
        return importance
