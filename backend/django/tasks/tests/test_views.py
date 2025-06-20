# your_app/tests/test_views.py
from django.test import Client, RequestFactory, TestCase
from django.urls import reverse
from tasks.models import Category
from tasks.views import CategoryBlockView


class CategoryBlockViewTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.client = Client()
        self.view_instance = CategoryBlockView()
        try:
            self.url = reverse("category_block")
        except Exception:
            self.url = "/tree/categories-block/"

    def test_get_category_tree_empty(self):
        self.assertEqual(self.view_instance._get_category_tree([]), [])

    def test_get_category_tree_flat(self):
        Category.objects.create(name="B")
        Category.objects.create(name="A")
        tree = self.view_instance._get_category_tree(Category.objects.all())
        self.assertEqual(len(tree), 2)
        self.assertEqual(tree[0]["category"].name, "A")
        self.assertEqual(tree[1]["category"].name, "B")

    def test_get_category_tree_nested(self):
        p = Category.objects.create(name="Parent")
        Category.objects.create(name="Child1", parent_category=p)
        Category.objects.create(name="Child2", parent_category=p)
        tree = self.view_instance._get_category_tree(Category.objects.all())
        self.assertEqual(len(tree), 1)
        self.assertEqual(tree[0]["category"].name, "Parent")
        self.assertEqual(len(tree[0]["subcategories"]), 2)

    def test_get_context_data(self):
        Category.objects.create(name="Root")
        request = self.factory.get(self.url)
        view = CategoryBlockView()
        view.setup(request)
        context = view.get_context_data()
        self.assertIn("nodes", context)
        self.assertEqual(len(context["nodes"]), 1)
        self.assertEqual(context["nodes"][0]["category"].name, "Root")
