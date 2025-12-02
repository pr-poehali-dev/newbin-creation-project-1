import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event, context):
    '''
    Business: Handle reports, favorites and admin actions
    Args: event with httpMethod, body
    Returns: HTTP response with action result
    '''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-User-IP',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'report':
            entity_type = body_data.get('entity_type')
            entity_id = body_data.get('entity_id')
            user_ip = event.get('headers', {}).get('x-forwarded-for', '0.0.0.0').split(',')[0]
            
            cur.execute(
                "INSERT INTO reports (user_ip, entity_type, entity_id) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
                (user_ip, entity_type, entity_id)
            )
            
            if entity_type == 'pin':
                cur.execute("UPDATE pins SET reports = reports + 1 WHERE id = %s", (entity_id,))
            elif entity_type == 'comment':
                cur.execute("UPDATE comments SET reports = reports + 1 WHERE id = %s", (entity_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'favorite':
            user_id = body_data.get('user_id')
            pin_id = body_data.get('pin_id')
            is_favorite = body_data.get('is_favorite', True)
            
            if is_favorite:
                cur.execute(
                    "INSERT INTO favorites (user_id, pin_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (user_id, pin_id)
                )
            else:
                cur.execute(
                    "DELETE FROM favorites WHERE user_id = %s AND pin_id = %s",
                    (user_id, pin_id)
                )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'get_favorites':
            user_id = body_data.get('user_id')
            
            cur.execute("""
                SELECT p.*, u.username as author, u.is_verified as author_verified
                FROM pins p
                JOIN users u ON p.author_id = u.id
                JOIN favorites f ON f.pin_id = p.id
                WHERE f.user_id = %s AND p.reports < 10
                ORDER BY f.created_at DESC
            """, (user_id,))
            
            pins = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'pins': [dict(p) for p in pins]}, default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'is_favorite':
            user_id = body_data.get('user_id')
            pin_id = body_data.get('pin_id')
            
            cur.execute(
                "SELECT id FROM favorites WHERE user_id = %s AND pin_id = %s",
                (user_id, pin_id)
            )
            favorite = cur.fetchone()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'is_favorite': favorite is not None}),
                'isBase64Encoded': False
            }
    
    elif method == 'GET':
        params = event.get('queryStringParameters') or {}
        action = params.get('action')
        
        if action == 'check_report':
            entity_type = params.get('entity_type')
            entity_id = params.get('entity_id')
            user_ip = event.get('headers', {}).get('x-forwarded-for', '0.0.0.0').split(',')[0]
            
            cur.execute(
                "SELECT id FROM reports WHERE user_ip = %s AND entity_type = %s AND entity_id = %s",
                (user_ip, entity_type, entity_id)
            )
            reported = cur.fetchone()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'reported': reported is not None}),
                'isBase64Encoded': False
            }
    
    cur.close()
    conn.close()
    return {
        'statusCode': 400,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Invalid action'}),
        'isBase64Encoded': False
    }
