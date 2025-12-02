import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event, context):
    '''
    Business: Handle admin operations (list users, ban, verify)
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with admin data
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        admin_id = params.get('admin_id')
        search = params.get('search', '')
        
        if not admin_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not authorized'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT username FROM users WHERE id = %s", (admin_id,))
        admin = cur.fetchone()
        
        if not admin or admin['username'] != 'Developer':
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not authorized'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            SELECT id, username, is_verified, is_banned, created_at
            FROM users
            WHERE username ILIKE %s
            ORDER BY created_at DESC
            LIMIT 100
        """, (f'%{search}%',))
        
        users = cur.fetchall()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'users': [dict(u) for u in users]}, default=str),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        admin_id = body_data.get('admin_id')
        action = body_data.get('action')
        target_user_id = body_data.get('user_id')
        
        if not admin_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not authorized'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT username FROM users WHERE id = %s", (admin_id,))
        admin = cur.fetchone()
        
        if not admin or admin['username'] != 'Developer':
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not authorized'}),
                'isBase64Encoded': False
            }
        
        if action == 'ban':
            cur.execute("UPDATE users SET is_banned = true WHERE id = %s", (target_user_id,))
            conn.commit()
        elif action == 'unban':
            cur.execute("UPDATE users SET is_banned = false WHERE id = %s", (target_user_id,))
            conn.commit()
        elif action == 'verify':
            cur.execute("UPDATE users SET is_verified = true WHERE id = %s", (target_user_id,))
            conn.commit()
        elif action == 'unverify':
            cur.execute("UPDATE users SET is_verified = false WHERE id = %s", (target_user_id,))
            conn.commit()
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
