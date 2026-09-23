#!/usr/bin/env python3
"""
=============================================================================
4-Step Funnel & Step 2 Drop-Off Engagement Analysis Script (Python / Pandas)
=============================================================================
Steps:
  [Step 1: Land on site]
  [Step 2: View Product]
  [Step 3: Add to Cart]
  [Step 4: Purchase]

Also computes:
  - Ranked list of top 5 alternative pages visited by users dropping off at Step 2
  - Average time spent on those pages
=============================================================================
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sample_data(num_sessions=2000):
    """Generates realistic event tracking data with time and user journeys."""
    np.random.seed(42)
    records = []
    base_time = datetime(2026, 9, 1, 10, 0, 0)
    
    other_pages = [
        ('/pricing', 130, 40),
        ('/faq', 95, 30),
        ('/reviews', 140, 50),
        ('/comparison', 175, 60),
        ('/contact', 65, 20),
        ('/blog/health-tips', 85, 30),
        ('/about-us', 50, 15)
    ]
    
    for i in range(1, num_sessions + 1):
        session_id = f"sess_{i:04d}"
        user_id = f"user_{np.random.randint(100, 999)}"
        curr_time = base_time + timedelta(minutes=np.random.randint(1, 14400))
        
        # Step 1: Land on site (100%)
        dwell_s1 = int(np.random.normal(35, 10))
        records.append({
            'session_id': session_id,
            'user_id': user_id,
            'event_name': 'land_on_site',
            'page_url': '/',
            'time_spent_seconds': max(5, dwell_s1),
            'timestamp': curr_time
        })
        curr_time += timedelta(seconds=max(5, dwell_s1))
        
        # Step 2: View Product (65% conversion)
        reached_s2 = np.random.rand() < 0.65
        if not reached_s2:
            continue
            
        dwell_s2 = int(np.random.normal(70, 25))
        records.append({
            'session_id': session_id,
            'user_id': user_id,
            'event_name': 'view_product',
            'page_url': f"/product/prod_{np.random.randint(1, 10)}",
            'time_spent_seconds': max(10, dwell_s2),
            'timestamp': curr_time
        })
        curr_time += timedelta(seconds=max(10, dwell_s2))
        
        # Step 3: Add to Cart (45% of S2 continue, 55% drop off)
        reached_s3 = np.random.rand() < 0.45
        if not reached_s3:
            # User drops off at Step 2! They browse other pages instead
            num_other = np.random.randint(1, 4)
            chosen_pages = np.random.choice(len(other_pages), size=num_other, replace=False)
            for p_idx in chosen_pages:
                p_url, avg_t, std_t = other_pages[p_idx]
                dwell = max(10, int(np.random.normal(avg_t, std_t)))
                records.append({
                    'session_id': session_id,
                    'user_id': user_id,
                    'event_name': 'page_view',
                    'page_url': p_url,
                    'time_spent_seconds': dwell,
                    'timestamp': curr_time
                })
                curr_time += timedelta(seconds=dwell)
            continue
            
        # User adds to cart
        dwell_s3 = int(np.random.normal(45, 15))
        records.append({
            'session_id': session_id,
            'user_id': user_id,
            'event_name': 'add_to_cart',
            'page_url': '/cart',
            'time_spent_seconds': max(10, dwell_s3),
            'timestamp': curr_time
        })
        curr_time += timedelta(seconds=max(10, dwell_s3))
        
        # Step 4: Purchase (50% of S3 continue)
        reached_s4 = np.random.rand() < 0.50
        if reached_s4:
            dwell_s4 = int(np.random.normal(90, 20))
            records.append({
                'session_id': session_id,
                'user_id': user_id,
                'event_name': 'purchase',
                'page_url': '/checkout/success',
                'time_spent_seconds': max(15, dwell_s4),
                'timestamp': curr_time
            })
            
    return pd.DataFrame(records)


def perform_funnel_analysis(df: pd.DataFrame):
    """
    Computes strict sequential 4-step funnel metrics.
    """
    print("=" * 70)
    print("1. 4-STEP CONVERSION FUNNEL ANALYSIS")
    print("=" * 70)
    
    # 1. Step 1: Land on site
    s1 = df[(df['event_name'] == 'land_on_site') | (df['page_url'] == '/')].groupby('session_id')['timestamp'].min().reset_index()
    s1.rename(columns={'timestamp': 't_step1'}, inplace=True)
    
    # 2. Step 2: View Product
    s2 = df[(df['event_name'] == 'view_product') | (df['page_url'].str.startswith('/product'))].groupby('session_id')['timestamp'].min().reset_index()
    s2.rename(columns={'timestamp': 't_step2'}, inplace=True)
    
    # 3. Step 3: Add to Cart
    s3 = df[(df['event_name'] == 'add_to_cart') | (df['page_url'] == '/cart')].groupby('session_id')['timestamp'].min().reset_index()
    s3.rename(columns={'timestamp': 't_step3'}, inplace=True)
    
    # 4. Step 4: Purchase
    s4 = df[(df['event_name'] == 'purchase') | (df['page_url'] == '/checkout/success')].groupby('session_id')['timestamp'].min().reset_index()
    s4.rename(columns={'timestamp': 't_step4'}, inplace=True)
    
    # Merge sequentially
    funnel = s1.merge(s2, on='session_id', how='left')
    funnel['valid_s2'] = funnel['t_step2'] >= funnel['t_step1']
    
    funnel = funnel.merge(s3, on='session_id', how='left')
    funnel['valid_s3'] = funnel['valid_s2'] & (funnel['t_step3'] >= funnel['t_step2'])
    
    funnel = funnel.merge(s4, on='session_id', how='left')
    funnel['valid_s4'] = funnel['valid_s3'] & (funnel['t_step4'] >= funnel['t_step3'])
    
    c1 = len(funnel)
    c2 = funnel['valid_s2'].sum()
    c3 = funnel['valid_s3'].sum()
    c4 = funnel['valid_s4'].sum()
    
    summary = pd.DataFrame([
        {'Step': 'Step 1: Land on Site', 'Users/Sessions': c1, 'Step Conversion %': '100.0%', 'Overall Conversion %': '100.0%', 'Drop-off %': f"{((c1 - c2)/c1)*100:.1f}%"},
        {'Step': 'Step 2: View Product', 'Users/Sessions': c2, 'Step Conversion %': f"{(c2/c1)*100:.1f}%", 'Overall Conversion %': f"{(c2/c1)*100:.1f}%", 'Drop-off %': f"{((c2 - c3)/c2)*100:.1f}%"},
        {'Step': 'Step 3: Add to Cart', 'Users/Sessions': c3, 'Step Conversion %': f"{(c3/c2)*100:.1f}%", 'Overall Conversion %': f"{(c3/c1)*100:.1f}%", 'Drop-off %': f"{((c3 - c4)/c3)*100:.1f}%"},
        {'Step': 'Step 4: Purchase', 'Users/Sessions': c4, 'Step Conversion %': f"{(c4/c3)*100:.1f}%", 'Overall Conversion %': f"{(c4/c1)*100:.1f}%", 'Drop-off %': 'N/A (Final)'}
    ])
    
    print(summary.to_string(index=False))
    print(f"\nOverall Funnel Conversion Rate (Land -> Purchase): {(c4/c1)*100:.2f}%")
    print(f"Total Step 2 Drop-Offs: {c2 - c3} sessions ({((c2 - c3)/c2)*100:.1f}%)\n")
    
    return funnel


def analyze_step2_dropoffs(df: pd.DataFrame, funnel: pd.DataFrame):
    """
    Identifies users who dropped off at Step 2 and ranks the top 5 alternative pages visited
    along with their average time spent on those pages.
    """
    print("=" * 70)
    print("2. STEP 2 DROP-OFF DEEP DIVE: TOP 5 OTHER PAGES VISITED & TIME SPENT")
    print("=" * 70)
    
    # Isolate drop-offs at Step 2: reached Step 2, but did NOT complete Step 3
    dropoff_sessions = funnel[funnel['valid_s2'] & (~funnel['valid_s3'])][['session_id', 't_step2']]
    
    # Join with original event logs
    dropoff_events = df.merge(dropoff_sessions, on='session_id')
    
    # Filter for events occurring after viewing product, excluding product and entry pages
    alt_pages = dropoff_events[
        (dropoff_events['timestamp'] >= dropoff_events['t_step2']) &
        (~dropoff_events['page_url'].str.startswith('/product')) &
        (~dropoff_events['page_url'].isin(['/', '/login', '/signup']))
    ]
    
    # Aggregate by page URL
    page_stats = alt_pages.groupby('page_url').agg(
        dropoff_visitors=('session_id', 'nunique'),
        total_views=('timestamp', 'count'),
        avg_time_spent_seconds=('time_spent_seconds', 'mean')
    ).reset_index()
    
    # Sort and rank top 5
    page_stats = page_stats.sort_values(by=['dropoff_visitors', 'avg_time_spent_seconds'], ascending=[False, False])
    top_5 = page_stats.head(5).copy()
    top_5['Rank'] = range(1, len(top_5) + 1)
    
    # Format time spent into mm:ss
    top_5['Avg Time Spent'] = top_5['avg_time_spent_seconds'].apply(
        lambda s: f"{int(s // 60)}m {int(s % 60):02d}s ({s:.1f}s)"
    )
    
    result_table = top_5[['Rank', 'page_url', 'dropoff_visitors', 'total_views', 'Avg Time Spent']]
    result_table.columns = ['Rank', 'Page Visited Instead', 'Unique Drop-Off Visitors', 'Total Views', 'Avg Time Spent']
    
    print(result_table.to_string(index=False))
    print("=" * 70)
    return top_5


if __name__ == '__main__':
    print("Generating sample telemetry data...")
    df_events = generate_sample_data(num_sessions=2500)
    funnel_df = perform_funnel_analysis(df_events)
    top_5_df = analyze_step2_dropoffs(df_events, funnel_df)
