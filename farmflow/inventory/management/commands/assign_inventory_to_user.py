from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from inventory.models import FeedStock, Medication, PriceHistory, PurchaseOrder, Supplier


class Command(BaseCommand):
    help = "Assign existing inventory records without an owner to a chosen user."

    def add_arguments(self, parser):
        parser.add_argument("--username", type=str, help="Username to assign orphaned inventory records to.")
        parser.add_argument("--user-id", type=int, help="User ID to assign orphaned inventory records to.")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show how many records would be reassigned without saving changes.",
        )

    def handle(self, *args, **options):
        User = get_user_model()

        user = None
        if options["user_id"] is not None:
            user = User.objects.filter(id=options["user_id"]).first()
            if not user:
                raise CommandError(f"User with id {options['user_id']} was not found.")
        elif options["username"]:
            user = User.objects.filter(username=options["username"]).first()
            if not user:
                raise CommandError(f"User '{options['username']}' was not found.")
        else:
            users = list(User.objects.order_by("id"))
            if len(users) == 1:
                user = users[0]
            else:
                raise CommandError(
                    "Multiple users exist. Please pass --username or --user-id to pick the target user."
                )

        models = [Supplier, FeedStock, Medication, PurchaseOrder, PriceHistory]
        total_orphans = 0
        summary = []

        for model in models:
            queryset = model.objects.filter(user__isnull=True)
            count = queryset.count()
            total_orphans += count
            summary.append((model.__name__, count))

        if total_orphans == 0:
            self.stdout.write(self.style.SUCCESS(f"No orphaned inventory records found for user {user.username}."))
            return

        if options["dry_run"]:
            self.stdout.write(
                self.style.WARNING(
                    f"Dry run: {total_orphans} orphaned records would be assigned to '{user.username}'."
                )
            )
            for model_name, count in summary:
                if count:
                    self.stdout.write(f"- {model_name}: {count}")
            return

        for model in models:
            queryset = model.objects.filter(user__isnull=True)
            updated = queryset.update(user=user)
            self.stdout.write(f"Assigned {updated} {model.__name__} records to {user.username}.")

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. {total_orphans} orphaned inventory records were assigned to '{user.username}'."
            )
        )
