"""add buyer profile image column

Revision ID: add_buyer_profile_image
Revises: add_messages_table
Create Date: 2025-11-20 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_buyer_profile_image'
down_revision = 'add_messages_table'
branch_labels = None
depends_on = None


def upgrade():
    # Add profile_image column to buyer_profiles table
    with op.batch_alter_table('buyer_profiles', schema=None) as batch_op:
        batch_op.add_column(sa.Column('profile_image', sa.String(length=500), nullable=True))


def downgrade():
    # Remove profile_image column from buyer_profiles table
    with op.batch_alter_table('buyer_profiles', schema=None) as batch_op:
        batch_op.drop_column('profile_image')
