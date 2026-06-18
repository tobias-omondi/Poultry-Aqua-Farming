from __future__ import annotations

from typing import Dict, Any, Optional

import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


def train_model(
    historical: pd.DataFrame,
    target_col: str = "production",
    model_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Train a simple regression pipeline on numeric features.

    Returns a dict with keys: 'pipeline' and 'numeric_cols'. Optionally saves
    the model bundle to `model_path` using joblib.
    """
    if target_col not in historical.columns:
        raise ValueError(f"target_col '{target_col}' not in historical DataFrame")

    X = historical.drop(columns=[target_col])
    y = historical[target_col]

    numeric_cols = X.select_dtypes(include=["number"]).columns.tolist()
    if not numeric_cols:
        raise ValueError("No numeric features found in historical data")

    preproc = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    pipeline = Pipeline([
        ("preproc", preproc),
        ("model", RandomForestRegressor(n_estimators=100, random_state=42)),
    ])

    pipeline.fit(X[numeric_cols], y)

    model_bundle = {"pipeline": pipeline, "numeric_cols": numeric_cols}
    if model_path:
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        joblib.dump(model_bundle, model_path)

    return model_bundle


def predict(model_bundle: Dict[str, Any], features: Dict[str, Any]) -> float:
    """Predict production given a trained `model_bundle` and a features dict.

    The features dict may contain extra keys; only numeric columns used at
    training time are selected.
    """
    df = pd.DataFrame([features])
    numeric_cols = model_bundle["numeric_cols"]
    X = df.reindex(columns=numeric_cols)
    # Ensure types are numeric where possible
    X = X.apply(pd.to_numeric, errors="coerce")
    pred = model_bundle["pipeline"].predict(X)
    return float(pred[0])


def save_model(model_bundle: Dict[str, Any], path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    joblib.dump(model_bundle, path)


def load_model(path: str) -> Dict[str, Any]:
    return joblib.load(path)


__all__ = ["train_model", "predict", "save_model", "load_model"]


# --- Domain-specific helpers ---
from datetime import date, timedelta
import numpy as np


def predict_harvest_date(batch: Dict[str, Any], days_ahead: int = 180) -> Dict[str, Any]:
    """Estimate target harvest date for a broiler batch.

    Inputs in `batch` (preferred):
    - current_age_days (int)
    - current_avg_weight_kg (float)
    - target_weight_kg (float)
    - recent_gain_kg_per_day (optional float)

    Returns dict with `estimated_harvest_date` (ISO string) and `days_remaining`.
    """
    today = date.today()
    cur_age = float(batch.get("current_age_days", 0.0))
    cur_w = float(batch.get("current_avg_weight_kg", 0.0))
    target_w = float(batch.get("target_weight_kg", 2.2))

    if cur_w >= target_w:
        return {"estimated_harvest_date": today.isoformat(), "days_remaining": 0}

    gain = batch.get("recent_gain_kg_per_day")
    if gain is None:
        # fallback heuristic: typical ADG (average daily gain) for broilers
        gain = 0.05 if cur_age > 7 else 0.02

    if gain <= 0:
        return {"error": "Insufficient data to estimate growth"}

    days_needed = int(np.ceil((target_w - cur_w) / gain))
    days_needed = max(0, min(days_needed, days_ahead))
    est_date = today + timedelta(days=days_needed)
    return {"estimated_harvest_date": est_date.isoformat(), "days_remaining": int(days_needed)}


def predict_egg_trajectory(house: Dict[str, Any], temp_forecast_c: Optional[list] = None, days: int = 30) -> Dict[str, Any]:
    """Predict total eggs over the next `days` for a layer house.

    `house` keys: `current_daily_eggs` (float), `house_size` (int, optional)
    `temp_forecast_c`: optional list of daily temps; if provided, adjusts production.
    Simple model: baseline eggs/day decays slightly with heat stress above 28C.
    """
    baseline = float(house.get("current_daily_eggs", 0.0))
    if baseline <= 0:
        return {"total_eggs": 0, "daily": [0] * days}

    daily = []
    for i in range(days):
        temp = temp_forecast_c[i] if (temp_forecast_c and i < len(temp_forecast_c)) else 25.0
        # loss per degree above 28C: 0.8% eggs/day
        loss_factor = 1.0
        if temp > 28.0:
            loss_factor -= 0.008 * (temp - 28.0)
        loss_factor = max(0.6, loss_factor)
        daily_val = baseline * loss_factor
        daily.append(float(max(0.0, daily_val)))

    total = float(np.sum(daily))
    return {"total_eggs": total, "daily": daily}


def predict_batch_biomass(herd: Dict[str, Any], days: int = 30) -> Dict[str, Any]:
    """Forecast combined market weight for a herd after `days` days.

    `herd` keys: `count` (int), `avg_weight_kg` (float), `daily_gain_kg` (optional float)
    """
    count = int(herd.get("count", 0))
    avg = float(herd.get("avg_weight_kg", 0.0))
    gain = herd.get("daily_gain_kg")
    if gain is None:
        gain = 0.08  # conservative default for goats

    future_avg = avg + gain * days
    total_future_biomass = float(count * future_avg)
    return {"future_avg_weight_kg": future_avg, "total_future_biomass_kg": total_future_biomass}


def detect_feed_efficiency_drop(history: pd.DataFrame, window: int = 7, threshold: float = 0.15) -> Dict[str, Any]:
    """Detect if feed efficiency (weight gain per feed) is degrading.

    `history` must contain columns: `date`, `feed_kg`, `avg_weight_kg` (or `total_weight_kg`).
    Computes weekly average FCR-like metric and flags if it worsens by `threshold` proportion.
    Returns {'alert': bool, 'current_fcr': float, 'previous_fcr': float}
    """
    df = history.copy()
    if "feed_kg" not in df.columns or "avg_weight_kg" not in df.columns:
        return {"error": "history must include feed_kg and avg_weight_kg"}

    df = df.sort_values(by="date")
    df["weight_change"] = df["avg_weight_kg"].diff()
    df["weight_change"] = df["weight_change"].fillna(0.0)

    # compute rolling sums
    df["feed_roll"] = df["feed_kg"].rolling(window=window, min_periods=1).sum()
    df["gain_roll"] = df["weight_change"].rolling(window=window, min_periods=1).sum()

    # avoid division by zero
    df = df[df["gain_roll"] > 0]
    if df.empty:
        return {"alert": False, "reason": "no positive weight gains in history"}

    current_fcr = (df["feed_roll"].iloc[-1] / df["gain_roll"].iloc[-1])
    prev_idx = max(0, len(df) - 2)
    previous_fcr = (df["feed_roll"].iloc[prev_idx] / df["gain_roll"].iloc[prev_idx]) if len(df) > 1 else current_fcr

    deteriorated = (current_fcr - previous_fcr) / previous_fcr if previous_fcr > 0 else 0.0
    alert = deteriorated > threshold
    return {"alert": bool(alert), "current_fcr": float(current_fcr), "previous_fcr": float(previous_fcr), "deterioration": float(deteriorated)}


__all__.extend([
    "predict_harvest_date",
    "predict_egg_trajectory",
    "predict_batch_biomass",
    "detect_feed_efficiency_drop",
])
