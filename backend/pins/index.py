import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event, context):
    '''
    Business: Handle pins CRUD operations
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with pins data
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
        pin_id = params.get('id')
        user_id = params.get('user_id')
        sort_by = params.get('sort', 'newest')
        search = params.get('search', '')
        
        if pin_id:
            cur.execute("""
                UPDATE pins SET views = views + 1 WHERE id = %s
            """, (pin_id,))
            conn.commit()
            
            cur.execute("""
                SELECT p.*, u.username as author, u.is_verified as author_verified
                FROM pins p
                JOIN users u ON p.author_id = u.id
                WHERE p.id = %s AND p.reports < 10
            """, (pin_id,))
            pin = cur.fetchone()
            cur.close()
            conn.close()
            
            if not pin:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Pin not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'pin': dict(pin)}, default=str),
                'isBase64Encoded': False
            }
        
        order_clause = {
            'newest': 'p.created_at DESC',
            'oldest': 'p.created_at ASC',
            'views': 'p.views DESC'
        }.get(sort_by, 'p.created_at DESC')
        
        query = f"""
            SELECT p.*, u.username as author, u.is_verified as author_verified
            FROM pins p
            JOIN users u ON p.author_id = u.id
            WHERE p.reports < 10 
                AND (p.is_private = false OR p.author_id = %s)
                AND p.title ILIKE %s
            ORDER BY {order_clause}
            LIMIT 100
        """
        
        cur.execute(query, (user_id or 0, f'%{search}%'))
        pins = cur.fetchall()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'pins': [dict(p) for p in pins]}, default=str),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        title = body_data.get('title', '').strip()
        content = body_data.get('content', '').strip()
        author_id = body_data.get('author_id')
        is_private = body_data.get('is_private', False)
        tags = body_data.get('tags', [])
        
        if not title or not content or not author_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            INSERT INTO pins (title, content, author_id, is_private, tags)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, title, content, author_id, is_private, tags, views, reports, created_at
        """, (title, content, author_id, is_private, tags))
        
        pin = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'pin': dict(pin)}, default=str),
            'isBase64Encoded': False
        }
    
    elif method == 'DELETE':
        body_data = json.loads(event.get('body', '{}'))
        pin_id = body_data.get('pin_id')
        user_id = body_data.get('user_id')
        
        if not pin_id or not user_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing pin_id or user_id'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT username FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        
        if user and user['username'] == 'Developer':
            cur.execute("UPDATE pins SET reports = 999 WHERE id = %s", (pin_id,))
            conn.commit()
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
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Not authorized'}),
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
