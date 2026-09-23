-- ==============================================================================
-- 4-STEP CONVERSION FUNNEL & STEP 2 DROP-OFF ENGAGEMENT ANALYSIS (SQL)
-- Compatible with: PostgreSQL, BigQuery, Snowflake, ClickHouse, Databricks, Redshift
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: 4-STEP SEQUENCE FUNNEL CONVERSION METRICS
-- ------------------------------------------------------------------------------
WITH user_events AS (
    SELECT 
        user_id,
        session_id,
        page_url,
        event_name,
        time_spent_seconds,
        event_timestamp
    FROM analytics_events
    WHERE event_timestamp >= CURRENT_DATE - INTERVAL '30 days'
),

-- Identify the earliest occurrence of each step in the user's sequential journey
funnel_steps AS (
    SELECT 
        user_id,
        session_id,
        
        -- Step 1: Land on Site
        MIN(CASE 
            WHEN event_name IN ('land_on_site', 'page_view') AND page_url IN ('/', '/landing') 
            THEN event_timestamp 
        END) AS step1_land_time,
        
        -- Step 2: View Product / Service Details / Diagnosis Exploration
        MIN(CASE 
            WHEN event_name IN ('view_product', 'product_view', 'explore_service', 'view_diagnosis', 'check_vitals') 
              OR page_url LIKE '/product%' 
              OR page_url LIKE '/dashboard%'
              OR page_url LIKE '/onboarding%'
              OR page_url LIKE '/device-connect%'
              OR page_url LIKE '/ai-suggestions%'
            THEN event_timestamp 
        END) AS step2_view_prod_time,
        
        -- Step 3: Add to Cart / Report Upload / Assessment Intake
        MIN(CASE 
            WHEN event_name IN ('add_to_cart', 'cart_add', 'upload_report', 'start_assessment') 
              OR page_url LIKE '/cart%' 
              OR page_url LIKE '/reports%'
              OR page_url LIKE '/supply-chain%'
              OR page_url LIKE '/emergency%'
            THEN event_timestamp 
        END) AS step3_add_cart_time,
        
        -- Step 4: Purchase / Diagnosis Success
        MIN(CASE 
            WHEN event_name IN ('purchase', 'order_complete', 'diagnosis_complete', 'report_success') 
              OR page_url LIKE '/checkout/success%' 
              OR page_url LIKE '/purchase%'
            THEN event_timestamp 
        END) AS step4_purchase_time

    FROM user_events
    GROUP BY user_id, session_id
),

-- Enforce strict forward progression: S1 -> S2 -> S3 -> S4
validated_funnel AS (
    SELECT 
        user_id,
        session_id,
        step1_land_time,
        CASE WHEN step2_view_prod_time >= step1_land_time THEN step2_view_prod_time END AS step2_view_prod_time,
        CASE WHEN step3_add_cart_time >= step2_view_prod_time AND step2_view_prod_time >= step1_land_time THEN step3_add_cart_time END AS step3_add_cart_time,
        CASE WHEN step4_purchase_time >= step3_add_cart_time AND step3_add_cart_time >= step2_view_prod_time THEN step4_purchase_time END AS step4_purchase_time
    FROM funnel_steps
    WHERE step1_land_time IS NOT NULL
)

-- Summary of Funnel Step Counts and Conversion Rates
SELECT 
    COUNT(DISTINCT session_id) AS total_landed_step1,
    COUNT(DISTINCT CASE WHEN step2_view_prod_time IS NOT NULL THEN session_id END) AS reached_step2_view_product,
    COUNT(DISTINCT CASE WHEN step3_add_cart_time IS NOT NULL THEN session_id END) AS reached_step3_add_to_cart,
    COUNT(DISTINCT CASE WHEN step4_purchase_time IS NOT NULL THEN session_id END) AS reached_step4_purchase,
    
    -- Conversion Rates from Step 1 Baseline
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN step2_view_prod_time IS NOT NULL THEN session_id END) / NULLIF(COUNT(DISTINCT session_id), 0), 2) AS s1_to_s2_pct,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN step3_add_cart_time IS NOT NULL THEN session_id END) / NULLIF(COUNT(DISTINCT session_id), 0), 2) AS s1_to_s3_pct,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN step4_purchase_time IS NOT NULL THEN session_id END) / NULLIF(COUNT(DISTINCT session_id), 0), 2) AS overall_conversion_pct,
    
    -- Step-to-Step Drop-Off Rates
    ROUND(100.0 * (COUNT(DISTINCT session_id) - COUNT(DISTINCT CASE WHEN step2_view_prod_time IS NOT NULL THEN session_id END)) / NULLIF(COUNT(DISTINCT session_id), 0), 2) AS step1_dropoff_pct,
    ROUND(100.0 * (COUNT(DISTINCT CASE WHEN step2_view_prod_time IS NOT NULL THEN session_id END) - COUNT(DISTINCT CASE WHEN step3_add_cart_time IS NOT NULL THEN session_id END)) / NULLIF(COUNT(DISTINCT CASE WHEN step2_view_prod_time IS NOT NULL THEN session_id END), 0), 2) AS step2_dropoff_pct,
    ROUND(100.0 * (COUNT(DISTINCT CASE WHEN step3_add_cart_time IS NOT NULL THEN session_id END) - COUNT(DISTINCT CASE WHEN step4_purchase_time IS NOT NULL THEN session_id END)) / NULLIF(COUNT(DISTINCT CASE WHEN step3_add_cart_time IS NOT NULL THEN session_id END), 0), 2) AS step3_dropoff_pct
FROM validated_funnel;


-- ------------------------------------------------------------------------------
-- PART 2: TOP 5 OTHER PAGES VISITED BY USERS WHO DROPPED OFF AT STEP 2
-- (Along with their Average Time Spent on Those Pages)
-- ------------------------------------------------------------------------------
WITH user_events AS (
    SELECT 
        user_id,
        session_id,
        page_url,
        event_name,
        time_spent_seconds,
        event_timestamp
    FROM analytics_events
    WHERE event_timestamp >= CURRENT_DATE - INTERVAL '30 days'
),

funnel_status AS (
    SELECT 
        session_id,
        MIN(CASE WHEN event_name IN ('land_on_site', 'page_view') AND page_url = '/' THEN event_timestamp END) AS step1_time,
        MIN(CASE WHEN event_name IN ('view_product', 'product_view') OR page_url LIKE '/product%' THEN event_timestamp END) AS step2_time,
        MIN(CASE WHEN event_name IN ('add_to_cart', 'cart_add') OR page_url LIKE '/cart%' THEN event_timestamp END) AS step3_time
    FROM user_events
    GROUP BY session_id
),

-- Isolate drop-off sessions: reached Step 1 AND Step 2, but NEVER reached Step 3
step2_dropoffs AS (
    SELECT 
        session_id,
        step2_time
    FROM funnel_status
    WHERE step1_time IS NOT NULL 
      AND step2_time >= step1_time 
      AND step3_time IS NULL
),

-- Retrieve other pages visited by these users after seeing the product
other_pages_visited AS (
    SELECT 
        e.session_id,
        e.page_url,
        COALESCE(e.time_spent_seconds, 0) AS time_spent_seconds
    FROM user_events e
    INNER JOIN step2_dropoffs d 
        ON e.session_id = d.session_id
    WHERE e.event_timestamp >= d.step2_time
      -- Exclude the product page itself and landing page
      AND e.page_url NOT LIKE '/product%'
      AND e.page_url NOT IN ('/', '/login', '/signup')
),

aggregated_pages AS (
    SELECT 
        page_url,
        COUNT(DISTINCT session_id) AS dropoff_visitors_count,
        COUNT(*) AS total_pageviews,
        ROUND(AVG(time_spent_seconds), 1) AS avg_time_spent_seconds,
        ROUND(AVG(time_spent_seconds) / 60.0, 2) AS avg_time_spent_minutes
    FROM other_pages_visited
    GROUP BY page_url
),

ranked_pages AS (
    SELECT 
        page_url,
        dropoff_visitors_count,
        total_pageviews,
        avg_time_spent_seconds,
        avg_time_spent_minutes,
        DENSE_RANK() OVER (ORDER BY dropoff_visitors_count DESC, avg_time_spent_seconds DESC) AS page_rank
    FROM aggregated_pages
)

-- Return Top 5 Ranked Alternative Pages
SELECT 
    page_rank,
    page_url,
    dropoff_visitors_count,
    total_pageviews,
    avg_time_spent_seconds,
    CONCAT(FLOOR(avg_time_spent_seconds / 60), 'm ', MOD(CAST(avg_time_spent_seconds AS INT), 60), 's') AS avg_dwell_formatted
FROM ranked_pages
WHERE page_rank <= 5
ORDER BY page_rank ASC;
