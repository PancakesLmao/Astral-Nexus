<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="dashboard-title">Admin Dashboard</h1>
          </div>
          <div class="col-auto">
            <button @click="logout" class="btn btn-outline-danger logout-btn">
              <LogOut class="me-2" :size="16" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Stats -->
    <div class="container-fluid mb-4">
      <div class="row">
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon">
              <Users :size="24" />
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalUsers || 0 }}</h3>
              <p>Total Users</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon">
              <FileText :size="24" />
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalPosts || 0 }}</h3>
              <p>Total Posts</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon">
              <MessageCircle :size="24" />
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalComments || 0 }}</h3>
              <p>Total Comments</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="container-fluid">
      <ul class="nav nav-tabs admin-tabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            :class="['nav-link', { active: activeTab === 'users' }]"
            @click="activeTab = 'users'"
            type="button"
          >
            <Users :size="16" class="me-2" />
            Users Management
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            :class="['nav-link', { active: activeTab === 'posts' }]"
            @click="activeTab = 'posts'"
            type="button"
          >
            <FileText :size="16" class="me-2" />
            Posts Management
          </button>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Users Tab -->
        <div v-if="activeTab === 'users'" class="tab-pane fade show active">
          <div class="admin-section">
            <div class="section-header">
              <h3>Users Management</h3>
              <button @click="fetchUsers" class="btn btn-outline-primary">
                <RefreshCw :size="16" class="me-2" />
              </button>
            </div>

            <div v-if="loadingUsers" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else class="table-responsive">
              <div v-if="users.length === 0" class="text-center py-4">
                <p class="text-white-50">No users found</p>
              </div>
              <table v-else class="table admin-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Provider</th>
                    <th>Join Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>
                      <img
                        :src="user.picture || '/default-avatar.png'"
                        :alt="user.name"
                        class="user-avatar"
                      />
                    </td>
                    <td class="fw-medium">{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span class="badge bg-info">{{ user.provider_name }}</span>
                    </td>
                    <td>{{ formatDate(user.created_at) }}</td>
                    <td>
                      <span class="badge bg-success">Active</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Posts Tab -->
        <div v-if="activeTab === 'posts'" class="tab-pane fade show active">
          <div class="admin-section">
            <div class="section-header">
              <h3>Posts Management</h3>
              <button @click="fetchPosts" class="btn btn-outline-primary">
                <RefreshCw :size="16" class="me-2" />
              </button>
            </div>

            <div v-if="loadingPosts" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else class="posts-grid">
              <div v-for="post in posts" :key="post.id" class="post-card">
                <div class="post-header">
                  <div class="post-meta">
                    <img
                      :src="post.author_picture || '/default-avatar.png'"
                      :alt="post.author_name"
                      class="post-author-avatar"
                    />
                    <div>
                      <h5 class="post-title">{{ post.title }}</h5>
                      <p class="post-author">by {{ post.author_name }}</p>
                    </div>
                  </div>
                  <div class="post-actions">
                    <button
                      @click="deletePost(post.id)"
                      class="btn btn-sm btn-outline-danger"
                      :disabled="deletingPostId === post.id"
                    >
                      <Trash2 v-if="deletingPostId !== post.id" :size="14" />
                      <div v-else class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div class="post-content">
                  <p>{{ truncateContent(post.content, 150) }}</p>
                </div>

                <div class="post-stats">
                  <span class="stat">
                    <ThumbsUp :size="14" />
                    {{ post.likes_count || 0 }} Likes
                  </span>
                  <span class="stat">
                    <MessageCircle :size="14" />
                    {{ post.comments_count || 0 }} Comments
                  </span>
                  <span class="stat">
                    <Calendar :size="14" />
                    {{ formatDate(post.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Delete</h5>
            <button @click="showDeleteModal = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteModal = false" type="button" class="btn btn-secondary">
              Cancel
            </button>
            <button @click="confirmDelete" type="button" class="btn btn-danger">Delete Post</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal-backdrop show"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import {
  Users,
  FileText,
  MessageCircle,
  RefreshCw,
  Trash2,
  Calendar,
  LogOut,
  ThumbsUp,
} from 'lucide-vue-next'
import { apiClient } from '@/shared/api'
import { getAppUrl } from '@/shared/utils'

// Reactive data
const activeTab = ref('users')
const loadingUsers = ref(false)
const loadingPosts = ref(false)
const users = ref<
  Array<{
    id: string
    name: string
    email: string
    picture?: string
    provider_name: string
    created_at: string
    posts_count: number
  }>
>([])
const posts = ref<
  Array<{
    id: string
    title: string
    content: string
    author_name: string
    author_picture?: string
    likes_count: number
    comments_count: number
    created_at: string
    game_name?: string
  }>
>([])
const stats = ref({
  totalUsers: 0,
  totalPosts: 0,
  totalComments: 0,
  activeUsers: 0,
})
const deletingPostId = ref<string | null>(null)
const showDeleteModal = ref(false)
const postToDelete = ref<string | null>(null)

// Admin API methods using the centralized ApiClient
class AdminApiClient {
  constructor(private baseUrl: string) {}

  async fetchDashboardStats(): Promise<{
    totalUsers: number
    totalPosts: number
    totalComments: number
    activeUsers: number
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/dashboard/stats`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch dashboard stats')
      }

      return data.stats
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  async fetchUsers(limit: number = 100): Promise<
    Array<{
      id: string
      name: string
      email: string
      picture?: string
      provider: string
      createdAt: string
    }>
  > {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users?limit=${limit}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      return data.data.users
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  }
}

// Initialize admin API client
const adminApiClient = new AdminApiClient(apiClient['baseUrl'])

// Fetch dashboard statistics
const fetchStats = async () => {
  try {
    const statsData = await adminApiClient.fetchDashboardStats()
    stats.value = statsData
    console.log('Updated stats:', stats.value) // Debug log
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

// Fetch users
const fetchUsers = async () => {
  loadingUsers.value = true
  try {
    const usersData = await adminApiClient.fetchUsers(100)
    users.value = usersData.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      provider_name: user.provider, // Backend sends 'provider', frontend expects 'provider_name'
      created_at: user.createdAt, // Backend sends 'createdAt', frontend expects 'created_at'
      posts_count: 0,
    }))
    console.log('Mapped users:', users.value) // Debug log
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loadingUsers.value = false
  }
}

// Fetch posts using existing apiClient
const fetchPosts = async () => {
  loadingPosts.value = true
  try {
    const { posts: postsData } = await apiClient.fetchPosts({ limit: 50 })
    posts.value = postsData.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author_name: post.author.name,
      author_picture: post.author.picture,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      created_at: post.created_at,
      game_name: post.game_category,
    }))
  } catch (error) {
    console.error('Error fetching posts:', error)
  } finally {
    loadingPosts.value = false
  }
}

// Delete post
const deletePost = (postId: string) => {
  postToDelete.value = postId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!postToDelete.value) return

  deletingPostId.value = postToDelete.value
  try {
    await adminApiClient.deletePost(postToDelete.value)
    // Remove post from the list
    posts.value = posts.value.filter((post) => post.id !== postToDelete.value)
    // Update stats
    stats.value.totalPosts--
  } catch (error) {
    console.error('Error deleting post:', error)
    alert('Failed to delete post: ' + (error as Error).message)
  } finally {
    deletingPostId.value = null
    showDeleteModal.value = false
    postToDelete.value = null
  }
}

const logout = async () => {
  try {
    await adminApiClient.logout()
    window.location.href = getAppUrl()
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const truncateContent = (content: string, maxLength: number) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

// Initialize dashboard
onMounted(() => {
  fetchStats()
  fetchUsers()
  fetchPosts()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1b23 0%, #2d2e36 100%);
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 2rem 0;
  margin: 1rem;
  margin-bottom: 2rem;
  border-radius: 1.5rem;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0;
}

/* Stats Cards */
.stat-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  border-color: rgba(255, 107, 53, 0.3);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #ffffff;
}

.stat-content p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0;
  font-size: 0.9rem;
}

/* Admin Tabs */
.admin-tabs {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 12px 12px 0 0;
  padding: 0;
}

.admin-tabs .nav-link {
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease;
}

.admin-tabs .nav-link:hover {
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
}

.admin-tabs .nav-link.active {
  background: #ff6b35;
  color: white;
}

/* Admin Section */
.admin-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 0 12px 12px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.section-header h3 {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 0;
}

/* Users Table */
.table-responsive {
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
}

.admin-table {
  margin-bottom: 0;
  color: #ffffff;
  background: transparent;
  border: none;
}

.admin-table th {
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: #ffffff;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  border-left: none;
  border-right: none;
  padding: 1rem 0.75rem;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.admin-table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  border-left: none;
  border-right: none;
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
}

.admin-table tbody tr {
  background: transparent;
  transition: background-color 0.2s ease;
}

.admin-table tbody tr:hover {
  background: rgba(255, 107, 53, 0.1);
}

.admin-table tbody tr:nth-child(odd) {
  background: rgba(255, 255, 255, 0.02);
}

.admin-table tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.05);
}

.admin-table tbody tr:nth-child(odd):hover,
.admin-table tbody tr:nth-child(even):hover {
  background: rgba(255, 107, 53, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Posts Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.post-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.post-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 107, 53, 0.3);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.post-author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.post-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #ffffff;
  line-height: 1.3;
}

.post-author {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin-bottom: 0;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.post-content {
  margin-bottom: 1rem;
}

.post-content p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 0;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  white-space: nowrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

/* Modal Styling */
.modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

.modal-header {
  background: rgba(248, 249, 250, 0.9);
  border-bottom: 1px solid rgba(222, 226, 230, 0.5);
  border-radius: 12px 12px 0 0;
}

.modal-footer {
  border-top: 1px solid rgba(222, 226, 230, 0.5);
  background: rgba(248, 249, 250, 0.9);
  border-radius: 0 0 12px 12px;
}

/* Button Styles */
.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.logout-btn {
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.btn-outline-primary {
  border-color: #ff6b35;
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
}

.btn-outline-primary:hover {
  background: #ff6b35;
  border-color: #ff6b35;
  color: white;
}

.btn-outline-danger {
  border-color: #dc3545;
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.btn-outline-danger:hover {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-danger {
  background: #dc3545;
  border-color: #dc3545;
}

.btn-secondary {
  background: rgba(108, 117, 125, 0.8);
  border-color: rgba(108, 117, 125, 0.8);
}

/* Badge Styling */
.badge {
  border-radius: 6px;
  font-weight: 500;
}

.badge.bg-info {
  background: rgba(13, 202, 240, 0.8) !important;
}

.badge.bg-secondary {
  background: rgba(108, 117, 125, 0.8) !important;
}

.badge.bg-success {
  background: rgba(25, 135, 84, 0.8) !important;
}

.badge.bg-primary {
  background: rgba(255, 107, 53, 0.8) !important;
}

/* Loading Spinner */
.spinner-border {
  color: #ff6b35;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    margin: 0.5rem;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .admin-table {
    font-size: 0.85rem;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 576px) {
  .dashboard-header {
    padding: 1.5rem 1rem;
    margin: 0.5rem;
  }

  .admin-section {
    padding: 1rem;
  }

  .post-card {
    padding: 1rem;
  }
}
</style>
