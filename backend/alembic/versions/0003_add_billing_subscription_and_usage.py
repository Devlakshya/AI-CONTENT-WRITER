"""add billing subscription and usage tables

Revision ID: 0003_add_billing_subscription_and_usage
Revises: 0002_update_content_generation
Create Date: 2026-06-04 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

revision = '0003_add_billing_subscription_and_usage'
down_revision = '0002_update_content_generation'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'plans',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False, unique=True),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('monthly_limit', sa.Integer(), nullable=False, default=20),
        sa.Column('unlimited', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.bulk_insert(
        sa.table(
            'plans',
            sa.column('name', sa.String),
            sa.column('description', sa.String),
            sa.column('monthly_limit', sa.Integer),
            sa.column('unlimited', sa.Boolean),
            sa.column('created_at', sa.DateTime),
        ),
        [
            {
                'name': 'free',
                'description': '20 generations per month',
                'monthly_limit': 20,
                'unlimited': False,
                'created_at': datetime.utcnow(),
            },
            {
                'name': 'pro',
                'description': 'Unlimited generations',
                'monthly_limit': 0,
                'unlimited': True,
                'created_at': datetime.utcnow(),
            },
        ],
    )

    op.create_table(
        'subscriptions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('plan_name', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('stripe_customer_id', sa.String(length=255), nullable=True),
        sa.Column('stripe_subscription_id', sa.String(length=255), nullable=True),
        sa.Column('current_period_end', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        'usage_tracking',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('month', sa.String(length=7), nullable=False),
        sa.Column('generation_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('usage_tracking')
    op.drop_table('subscriptions')
    op.drop_table('plans')
