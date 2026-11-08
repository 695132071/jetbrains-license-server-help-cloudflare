// 支持与资源页面组件
const REPO_URL = 'https://github.com/Blduu/jetbrains-license-server-help-cloudflare'

const SponsorComponent = {
  name: 'SponsorComponent',
  data() {
    return {
      showQrModal: false,
      repoUrl: REPO_URL,
      qrImage: '/images/repo-qr.png',
      supportItems: [
        {
          id: 'star',
          name: '点个 Star',
          icon: '⭐',
          description: '让更多人发现这个项目',
          url: REPO_URL
        },
        {
          id: 'issue',
          name: '反馈问题',
          icon: '🐛',
          description: '提交 Issue 帮助改进',
          url: `${REPO_URL}/issues`
        },
        {
          id: 'contributing',
          name: '参与贡献',
          icon: '🔧',
          description: '欢迎提交 Pull Request',
          url: `${REPO_URL}/blob/main/CONTRIBUTING.md`
        },
        {
          id: 'jvm',
          name: 'JVM 版',
          icon: '☕',
          description: 'Spring Boot 完整功能版本',
          url: 'https://github.com/Blduu/jetbrains-helper'
        },
        {
          id: 'docs',
          name: '使用文档',
          icon: '📚',
          description: '部署、接口与架构说明',
          url: `${REPO_URL}/tree/main/docs`
        },
        {
          id: 'license',
          name: '开源许可',
          icon: '📄',
          description: 'EPL-2.0 许可证',
          url: `${REPO_URL}/blob/main/LICENSE`
        }
      ]
    }
  },
  methods: {
    openLink(url) {
      window.open(url, '_blank', 'noopener')
    },
    openQrModal() {
      this.showQrModal = true
    },
    closeQrModal() {
      this.showQrModal = false
    },
    copyRepoUrl() {
      Utils.copyToClipboard(this.repoUrl)
    }
  },
  template: `
    <div class="sponsor-page">
      <!-- 说明 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center space-x-2 mb-4">
          <span class="text-2xl">💙</span>
          <h2 class="text-2xl font-bold gradient-text">支持 JetBrains License Server Help</h2>
          <span class="text-2xl">💙</span>
        </div>
        <p class="text-gray-600 max-w-2xl mx-auto">
          本项目完全开源且免费。如果它对你有帮助，欢迎 Star、反馈问题或参与贡献，
          这是对项目持续维护最好的支持。
        </p>
      </div>

      <!-- 资源入口 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          v-for="item in supportItems"
          :key="item.id"
          @click="openLink(item.url)"
          class="sponsor-item bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200">
          <div class="text-center mb-4">
            <div class="sponsor-icon">{{ item.icon }}</div>
          </div>
          <div class="text-center">
            <h3 class="font-bold text-gray-900 mb-1">{{ item.name }}</h3>
            <p class="text-sm text-gray-500">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <!-- 仓库二维码 -->
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 md:p-8">
        <div class="flex flex-col md:flex-row items-center md:space-x-8 space-y-6 md:space-y-0">
          <div class="text-center md:text-left flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              <i class="fab fa-github text-gray-800 mr-2"></i>扫码访问项目仓库
            </h3>
            <p class="text-gray-600 text-sm leading-relaxed mb-4">
              使用手机扫码即可打开 GitHub 仓库，查看最新版本、提交反馈或参与贡献。
            </p>
            <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input :value="repoUrl" readonly class="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-0" />
              <button @click="copyRepoUrl" class="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap" title="复制仓库地址">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          <div class="qr-code-frame cursor-pointer" @click="openQrModal" title="点击放大">
            <img :src="qrImage" alt="项目仓库二维码" class="qr-code-image" />
          </div>
        </div>
      </div>

      <!-- 二维码放大弹窗 -->
      <transition name="modal">
        <div v-if="showQrModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @click.self="closeQrModal">
          <div class="payment-modal">
            <div class="payment-modal-header flex justify-between items-center">
              <h3 class="payment-title">💙 项目仓库</h3>
              <button @click="closeQrModal" class="close-button">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="payment-modal-content">
              <div class="payment-info">
                <div class="sponsor-title">扫码访问 GitHub</div>
                <div class="amount-info">JetBrains License Server Help (Cloudflare)</div>
              </div>
              <div class="qr-code-container text-center">
                <div class="qr-code-frame">
                  <img :src="qrImage" alt="项目仓库二维码" class="qr-code-image">
                </div>
                <div class="qr-tip">
                  <i class="fas fa-mobile-alt"></i>
                  <span>使用手机相机或微信扫一扫</span>
                </div>
              </div>
              <button @click="openLink(repoUrl)" class="w-full btn-primary text-white py-2 px-4 rounded-lg font-medium">
                <i class="fab fa-github mr-2"></i>在浏览器中打开
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  `
}
