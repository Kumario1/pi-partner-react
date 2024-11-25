import json
import os
import openai
import boto3
from datetime import datetime
import uuid
from PIL import Image
import pytesseract
import base64
import io

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ConversationHistory')

# Initialize S3 client
s3 = boto3.client('s3')

openai.api_key = os.getenv("OPENAI_API_KEY")

def validate_and_explain_math_problem(problem):
    # Prompt with clear structure for consistent response
    validation_prompt = f"""
    You are a highly knowledgeable math tutor. The input provided by the user could be a direct equation, expression, or a word problem. Your task is to identify whether the input is a valid math problem, including recognizing word problems.

    If the input is a valid math problem (including word problems), follow these steps:
    1. Identify the mathematical concept or topic involved (e.g., geometry, algebra, calculus, optimization).
    2. Provide a clear, step-by-step explanation to solve the problem.
    3. Offer a whole page worth of related practice problems that align with the identified concept and increase in difficulty.

    If the input is not a math problem, respond with: "Please limit yourself to only math questions. Thank You!"

    Problem: {problem}
    """
    messages = [{"role": "user", "content": validation_prompt}]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0,
    )
    explanation = response.choices[0].message["content"]
    return explanation

def log_conversation(user_id, problem, explanation, image_url=None):
    timestamp = datetime.now().isoformat()
    item = {
        'user_id': user_id,
        'timestamp': timestamp,
        'problem': problem,
        'explanation': explanation
    }
    if image_url:
        item['image_url'] = image_url
    table.put_item(Item=item)

def get_conversation_history(user_id):
    response = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('user_id').eq(user_id)
    )
    return response.get('Items', [])

def generate_user_id():
    return str(uuid.uuid4())

def process_image(image_data):
    try:
        # Decode base64 image data
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        extracted_text = pytesseract.image_to_string(image)
        return extracted_text.strip()
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

def lambda_function_handler(event, context):
    print(f"Event: {event}")
    try:
        body = event.get("body", None)
        if body is None:
            body = event
        
        print(f"Raw body: {body}")

        if isinstance(body, str):
            body = json.loads(body)
        print(f"Parsed body: {body}")

        user_id = body.get("user_id")
        is_new_user = False
        if not user_id:
            user_id = generate_user_id()
            is_new_user = True
            print(f"Generated new user_id: {user_id}")

        input_type = body.get("input_type", "")
        problem = body.get("problem", "")
        image_data = body.get("image_data", None)
        ocr_confirmation = body.get("ocr_confirmation", False)

        if input_type == "image" and image_data:
            # Process image
            extracted_text = process_image(image_data)
            if extracted_text:
                response_body = {
                    "problem": extracted_text,
                    "explanation": f"We detected the following problem from the image: '{extracted_text}'. Is this correct? Please confirm or input the correct problem.",
                    "user_id": user_id,
                    "requires_confirmation": True
                }
            else:
                response_body = {
                    "explanation": "Error extracting text from the image. Please provide a valid math problem.",
                    "user_id": user_id
                }
        elif input_type == "text" or ocr_confirmation:
            # Process text problem (whether it's a new input or a confirmation)
            if problem:
                explanation = validate_and_explain_math_problem(problem)
                log_conversation(user_id, problem, explanation)
                response_body = {
                    "problem": problem,
                    "explanation": explanation,
                    "user_id": user_id,
                    "requires_confirmation": False
                }
            else:
                response_body = {
                    "explanation": "Please provide a valid math problem.",
                    "user_id": user_id
                }
        else:
            response_body = {
                "explanation": "Please provide a valid math problem or an image.",
                "user_id": user_id
            }

        response_body["is_new_user"] = is_new_user

        # Return the response body as a JSON object, not a string
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(response_body)
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({"error": str(e)})
        }
import json
import os
import openai
import boto3
from datetime import datetime
import uuid
from PIL import Image
import pytesseract
import base64
import io

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ConversationHistory')

# Initialize S3 client
s3 = boto3.client('s3')

openai.api_key = os.getenv("OPENAI_API_KEY")

def validate_and_explain_math_problem(problem):
    # Prompt with clear structure for consistent response
    validation_prompt = f"""
    You are a highly knowledgeable math tutor. The input provided by the user could be a direct equation, expression, or a word problem. Your task is to identify whether the input is a valid math problem, including recognizing word problems.

    If the input is a valid math problem (including word problems), follow these steps:
    1. Identify the mathematical concept or topic involved (e.g., geometry, algebra, calculus, optimization).
    2. Provide a clear, step-by-step explanation to solve the problem.
    3. Offer a whole page worth of related practice problems that align with the identified concept and increase in difficulty.

    If the input is not a math problem, respond with: "Please limit yourself to only math questions. Thank You!"

    Problem: {problem}
    """
    messages = [{"role": "user", "content": validation_prompt}]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0,
    )
    explanation = response.choices[0].message["content"]
    return explanation

def log_conversation(user_id, problem, explanation, image_url=None):
    timestamp = datetime.now().isoformat()
    item = {
        'user_id': user_id,
        'timestamp': timestamp,
        'problem': problem,
        'explanation': explanation
    }
    if image_url:
        item['image_url'] = image_url
    table.put_item(Item=item)

def get_conversation_history(user_id):
    response = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('user_id').eq(user_id)
    )
    return response.get('Items', [])

def generate_user_id():
    return str(uuid.uuid4())

def process_image(image_data):
    try:
        # Decode base64 image data
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        extracted_text = pytesseract.image_to_string(image)
        return extracted_text.strip()
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

def lambda_function_handler(event, context):
    print(f"Event: {event}")
    try:
        body = event.get("body", None)
        if body is None:
            body = event
        
        print(f"Raw body: {body}")

        if isinstance(body, str):
            body = json.loads(body)
        print(f"Parsed body: {body}")

        user_id = body.get("user_id")
        is_new_user = False
        if not user_id:
            user_id = generate_user_id()
            is_new_user = True
            print(f"Generated new user_id: {user_id}")

        input_type = body.get("input_type", "")
        problem = body.get("problem", "")
        image_data = body.get("image_data", None)
        ocr_confirmation = body.get("ocr_confirmation", False)

        if input_type == "image" and image_data:
            # Process image
            extracted_text = process_image(image_data)
            if extracted_text:
                response_body = {
                    "problem": extracted_text,
                    "explanation": f"We detected the following problem from the image: '{extracted_text}'. Is this correct? Please confirm or input the correct problem.",
                    "user_id": user_id,
                    "requires_confirmation": True
                }
            else:
                response_body = {
                    "explanation": "Error extracting text from the image. Please provide a valid math problem.",
                    "user_id": user_id
                }
        elif input_type == "text" or ocr_confirmation:
            # Process text problem (whether it's a new input or a confirmation)
            if problem:
                explanation = validate_and_explain_math_problem(problem)
                log_conversation(user_id, problem, explanation)
                response_body = {
                    "problem": problem,
                    "explanation": explanation,
                    "user_id": user_id,
                    "requires_confirmation": False
                }
            else:
                response_body = {
                    "explanation": "Please provide a valid math problem.",
                    "user_id": user_id
                }
        else:
            response_body = {
                "explanation": "Please provide a valid math problem or an image.",
                "user_id": user_id
            }

        response_body["is_new_user"] = is_new_user

        # Return the response body as a JSON object, not a string
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(response_body)
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({"error": str(e)})
        }