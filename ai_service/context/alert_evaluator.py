def evaluate_contextual_alert(heart_rate, spo2, temperature, activity='resting', signal_quality=100, persistence_count=1):
    """
    Context-Aware False Alert Reduction Sentinel.
    Correlates vital thresholds with:
      - Physical Activity (Resting vs. Running/Exercise)
      - Sensor Signal Quality (Rejects motion artifacts)
      - Temporal Persistence (Differentiates transient spikes from sustained crises)
      
    Returns dict:
      {
        "should_alert": bool,
        "is_suppressed": bool,
        "severity": 'none' | 'normal_adaptation' | 'warning' | 'critical',
        "title": str,
        "reason": str
      }
    """
    # 1. Reject low signal quality artifacts (sensor movement / decoupling)
    if signal_quality < 45:
        return {
            "should_alert": False,
            "is_suppressed": True,
            "severity": "none",
            "title": "Low Signal Quality",
            "reason": "Temporary sensor detachment or motion artifact detected. Alert suppressed."
        }

    # 2. Activity-Aware Heart Rate Triage
    if heart_rate > 125:
        if activity in ['running', 'exercise']:
            # Exercise-induced tachycardia is a physiological compensatory response
            return {
                "should_alert": False,
                "is_suppressed": True,
                "severity": "normal_adaptation",
                "title": "Exercise Compensation",
                "reason": f"Heart rate of {heart_rate} BPM is consistent with {activity}. Normal cardiovascular response."
            }
        elif activity in ['resting', 'sleeping']:
            if persistence_count >= 2:
                return {
                    "should_alert": True,
                    "is_suppressed": False,
                    "severity": "critical",
                    "title": "Resting Tachycardia Alert",
                    "reason": f"Elevated heart rate ({heart_rate} BPM) sustained during {activity}."
                }
            else:
                return {
                    "should_alert": False,
                    "is_suppressed": True,
                    "severity": "warning",
                    "title": "Transient Cardiac Spike",
                    "reason": "Elevated reading detected while resting; confirming temporal persistence."
                }

    # 3. Critical Hypoxemia (SpO2) Triage
    if spo2 < 90:
        if persistence_count >= 2:
            return {
                "should_alert": True,
                "is_suppressed": False,
                "severity": "critical",
                "title": "Severe Hypoxemia Alert",
                "reason": f"Critical blood oxygen saturation ({spo2}%). Immediate respiratory support recommended."
            }
        else:
            return {
                "should_alert": False,
                "is_suppressed": True,
                "severity": "warning",
                "title": "Transient Oxygen Fluctuation",
                "reason": f"SpO2 reading at {spo2}%; verifying sensor optical seal."
            }

    # 4. Hyperthermia / High Fever Triage
    if temperature > 39.0:
        return {
            "should_alert": True,
            "is_suppressed": False,
            "severity": "critical",
            "title": "High Fever Warning",
            "reason": f"Body temperature ({temperature}°C) indicates significant pyrexia."
        }

    # 5. Normal Baseline
    return {
        "should_alert": False,
        "is_suppressed": False,
        "severity": "none",
        "title": "Optimal Telemetry",
        "reason": "Vitals and activity are within individualized healthy physiological bounds."
    }
