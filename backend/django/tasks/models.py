from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, null=False)
    description = models.TextField(blank=True, null=True)
    parent_category = models.ForeignKey(
        "self", on_delete=models.RESTRICT, null=True, blank=True, related_name="subcategories"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "category"
        verbose_name_plural = "Categories"
        ordering = ["updated_at"]

    def __str__(self):
        return self.name


class Task(models.Model):
    STATE_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("archived", "Archived"),
    ]

    title = models.CharField(max_length=255, null=False)
    due_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks"
    )
    state = models.CharField(max_length=50, choices=STATE_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "task"

    def __str__(self):
        return self.title


class TaskPlanning(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=False, related_name="plannings")
    planned_date = models.DateField(null=False)
    start_hour = models.TimeField(null=True, blank=True)
    end_hour = models.TimeField(null=True, blank=True)
    priority = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)], null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "task_planning"
        unique_together = ("task", "planned_date", "start_hour")
        ordering = ["planned_date", "start_hour", "priority"]

    def __str__(self):
        hour_display = ""
        if self.start_hour:
            if self.end_hour:
                hour_display = f"{self.start_hour} - {self.end_hour}"
            else:
                hour_display = f"{self.start_hour}"
        return f"{self.task.title} on {self.planned_date} {hour_display}"
