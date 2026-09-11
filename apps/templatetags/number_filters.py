from django import template

register = template.Library()


@register.filter
def dot_number(value):
    """
    Форматирует число с точкой как разделителем тысяч.
    500000 → 500.000
    1250000 → 1.250.000
    """
    try:
        value = int(float(value))
        return f"{value:,}".replace(",", ".")
    except (ValueError, TypeError):
        return value
