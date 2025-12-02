import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event, context):
    '''
    Business: Handle comments CRUD operations
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with comments data
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
        pin_id = params.get('pin_id')
        
        if not pin_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'pin_id required'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            SELECT c.*, u.username as author, u.is_verified as author_verified
            FROM comments c
            JOIN users u ON c.author_id = u.id
            WHERE c.pin_id = %s AND c.reports < 5
            ORDER BY c.created_at DESC
        """, (pin_id,))
        
        comments = cur.fetchall()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'comments': [dict(c) for c in comments]}, default=str),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        pin_id = body_data.get('pin_id')
        author_id = body_data.get('author_id')
        content = body_data.get('content', '').strip()
        
        if not pin_id or not author_id or not content:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            INSERT INTO comments (pin_id, author_id, content)
            VALUES (%s, %s, %s)
            RETURNING id, pin_id, author_id, content, reports, created_at
        """, (pin_id, author_id, content))
        
        comment = cur.fetchone()
        conn.commit()
        
        cur.execute("SELECT username, is_verified FROM users WHERE id = %s", (author_id,))
        user = cur.fetchone()
        
        result = dict(comment)
        result['author'] = user['username']
        result['author_verified'] = user['is_verified']
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'comment': result}, default=str),
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
