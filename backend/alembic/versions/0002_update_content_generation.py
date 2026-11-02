"""update content generation model

Revision ID: 0002_update_content_generation
Revises: 0001_initial
Create Date: 2026-06-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_update_content_generation'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    # Add title, target_audience, keywords, updated_at, language columns
    with op.batch_alter_table('content_generations') as batch_op:
        batch_op.add_column(sa.Column('title', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('target_audience', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('keywords', sa.String(length=1024), nullable=True))
        batch_op.add_column(sa.Column('language', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(), nullable=True))


def downgrade():
    with op.batch_alter_table('content_generations') as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('language')
        batch_op.drop_column('keywords')
        batch_op.drop_column('target_audience')
        batch_op.drop_column('title')
