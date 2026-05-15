# FastAPI: Pydantic Models

## 🎯 By End of This Lesson You Will:
- Define Pydantic models with field types and validation
- Use nested models for complex data structures
- Apply custom validators for business rules
- Configure models with defaults, examples, and descriptions

## 🌍 Real-World Analogy First

A Pydantic model is like a customs form. You declare exactly what should be in the package (name: string, price: float), and the customs officer (FastAPI) checks every package against the form. Anything missing, wrong type, or suspicious gets rejected before it enters the country.

## 📖 Start From Zero

```python
from pydantic import BaseModel, Field

class User(BaseModel):
    name: str
    email: str
    age: int = Field(ge=13, le=120, description="User age")
    is_active: bool = True

# Valid — all fields match
user = User(name="Alice", email="a@b.com", age=30)

# Invalid — missing field
user = User(name="Bob")  # ValidationError: email field required

# Invalid — wrong type
user = User(name="Bob", email="b@c.com", age="thirty")
# ValidationError: age value is not a valid integer

# Invalid — out of range
user = User(name="Bob", email="b@c.com", age=200)
# ValidationError: age must be ≤ 120
```

## 🔨 Level Up

### Field Types and Constraints

```python
from pydantic import BaseModel, Field, EmailStr
from typing import Literal

class Product(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0, description="Must be positive")
    category: Literal["electronics", "clothing", "food"]
    tags: list[str] = []
    in_stock: bool = True
    metadata: dict | None = None
```

### Nested Models

```python
class Address(BaseModel):
    street: str
    city: str
    country: str = "Kenya"

class Customer(BaseModel):
    name: str
    email: EmailStr  # requires: pip install pydantic[email]
    address: Address  # nested!

data = {
    "name": "Alice",
    "email": "alice@example.com",
    "address": {"street": "123 Main", "city": "Nairobi"}
}
customer = Customer(**data)
print(customer.address.city)  # "Nairobi"
```

### Custom Validators

```python
from pydantic import BaseModel, field_validator

class StudyLog(BaseModel):
    date: str
    minutes: int
    mood: str

    @field_validator("minutes")
    @classmethod
    def minutes_must_be_reasonable(cls, v: int) -> int:
        if v < 1 or v > 720:
            raise ValueError("Minutes must be between 1 and 720 (12 hours)")
        return v

    @field_validator("mood")
    @classmethod
    def mood_must_be_valid(cls, v: str) -> str:
        allowed = {"great", "good", "okay", "bad"}
        if v.lower() not in allowed:
            raise ValueError(f"Mood must be one of {allowed}")
        return v.lower()
```

## 🧪 Practice — Try Each Step

1. Create a `Book` model with title, author, pages, and genre (enum).
2. Add Field constraints: title 1-200 chars, pages > 0.
3. Create an `Author` model and nest it inside `Book`.
4. Add a custom validator that rejects books with "Untitled" as title.
5. Create a list field that accepts multiple tags.
6. Make one field optional with a default value.
7. Try creating a model with invalid data and read the error messages.

## ⚠️ Common Mistakes — Catch These Early

| Mistake | What You See | The Fix |
|---|---|---|
| `from typing import List` | Works but deprecated in Python 3.9+ | Use lowercase `list[str]` instead of `List[str]` |
| Forgetting `@classmethod` on validator | Validator runs incorrectly | Always add `@classmethod` decorator |
| `Field(ge=0)` on string field | No error, but meaningless | Only use numeric constraints on numeric fields |
| Nested model as plain dict | FastAPI doesn't validate nested fields | Always declare nested structures as Pydantic models |

## 🧠 Mental Model — One Sentence

Pydantic models are TypeScript interfaces that actually run — they validate data at runtime, not just compile time, catching bad data before it touches your application logic.

## 📝 Check Your Understanding

- **Define**: What's the difference between `Field()` and a plain type annotation?
- **Predict**: `Product(name="A", price=-5, category="food")` — valid or error?
- **Find the bug**: `class User(BaseModel): name: str; email: EmailStr` — why import error?
- **Write it**: Create a model with 5 fields, including a nested model and custom validator.
- **Apply it**: Add a validator that requires at least one tag in a `tags: list[str]` field.
- **Reflect**: How does Pydantic compare to Zod for validation?

## 🚀 What This Unlocks

Every FastAPI endpoint uses Pydantic. Request bodies, response shapes, query parameters — Pydantic validates them all. Master Pydantic, and you've mastered 50% of FastAPI.
