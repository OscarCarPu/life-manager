from django import forms

from .models import Category, Project


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = [
            "name",
            "description",
            "color",
            "parent_category",
        ]  # Include parent_category for easier handling
        widgets = {
            "name": forms.TextInput(attrs={"class": "form-control"}),
            "description": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
            "color": forms.ColorInput(attrs={"class": "form-control", "style": "width: 100px;"}),
        }

    # You can add custom validation here if needed
    def clean(self):
        cleaned_data = super().clean()
        name = cleaned_data.get("name")
        category_id = self.instance.id if self.instance else None

        # Check for unique name
        query = Category.objects.filter(name=name)
        if category_id:
            query = query.exclude(id=category_id)

        if query.exists():
            self.add_error(
                "name",
                f"A category with the name '{name}' already exists.",
            )
        return cleaned_data


class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = [
            "name",
            "description",
            "color",
            "category",
            "expected_start_date",
            "expected_end_date",
            "state",
        ]
        widgets = {
            "name": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Enter project name"}
            ),
            "description": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 3,
                    "placeholder": "Optional project description",
                }
            ),
            "color": forms.ColorInput(attrs={"class": "form-control form-control-color"}),
            "expected_start_date": forms.DateInput(attrs={"class": "form-control", "type": "date"}),
            "expected_end_date": forms.DateInput(attrs={"class": "form-control", "type": "date"}),
            "state": forms.Select(attrs={"class": "form-select"}),
            "category": forms.HiddenInput(),
        }
