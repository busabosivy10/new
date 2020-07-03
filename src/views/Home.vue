<template>
	<div class="home admin-panel">
		<div class="container" v-if="$store.state.isClientLoggedIn || $store.state.isAdminLoggedIn">
			<form @submit.prevent="submitComplaint()">
				<div class="form-group">
					<label>What/Who is the subject of your concern? *</label>
					<select name="target" v-model="target">
						<option value="none" style="display: none">Please select</option>
						<option>Facilities</option>
						<option>Instructor</option>
						<option>Portal</option>
						<option>Guidance</option>
						<option>Staff</option>
						<option>Event</option>
						<option>Library</option>
						<option>Registrar</option>
					</select>
				</div>
				<div class="form-group" v-if="target == 'Instructor'">
					<label>Department *</label>
					<select name="target" v-model="department" v-validate="'excluded:none'">
						<option value="none" style="display: none">Please select</option>
						<option>College of Computing Sciences (CCS)</option>
						<option>College of Technology (CT)</option>
						<option>College of Education (CE)</option>
						<option>College of Hospitality Management (CHM)</option>
						<option>College of Business and Public Administration (CBPA)</option>
						<option>Collge of Art Sciences and Letters (CASL)</option>
					</select>
				</div>
				<div class="form-group" v-if="target == 'Staff'">
					<label>Office *</label>
					<select name="target" v-model="office" v-validate="'excluded:none'">
						<option value="none" style="display: none">Please select</option>
						<option>Cashier</option>
						<option>Administrator</option>
						<option>Registrar</option>
					</select>
				</div>
				<div class="form-group">
					<label>What is this all about? *</label>
					<select v-model="about" v-validate="'excluded:none'">
						<option value="none" style="display: none">Please select</option>
						<option>Suggestion</option>
						<option>Feedback</option>
					</select>
				</div>
				<div class="form-group">
					<label>Your Complaint *</label>
					<textarea rows="6" placeholder="Type your concern" v-model="message" name="message" v-validate="'required'"></textarea>
				</div>
				<div class="captcha-container">
                    <vue-recaptcha class="g-recaptcha" sitekey="6Le-pnYUAAAAAGx0hkAt7zH_GX2xF3eGTIM66FOo"></vue-recaptcha>
                </div>
				<div class="buttons-container">
					<button type="submit">Submit</button>
					<button class="reset" type="button" @click="reset()">Reset Form</button>
				</div>
			</form>
		</div>
		<div v-if="$store.state.isAdminLoggedIn == false">
			<div class="container login-container" v-if="$store.state.isClientLoggedIn == false && authState == 1">
				<img src="/logo.png" class="logo">
				<p class="h3">User Login</p>
				<form @submit.prevent="clientLogin()">
					<div class="form-group">
						<input type="text" placeholder="Username (ID Number)" v-model="login.username" autofocus>
					</div>
					<div class="form-group">
						<input type="password" placeholder="Password" v-model="login.password">
					</div>
					<div class="form-group">
						<button type="submit">Login</button>
					</div>
				</form>
			</div>
		</div>
		</div>
	</div>
</template>

<script>
	import db from '../services/firebase'
	import $ from 'jquery'
	import jwt from 'jsonwebtoken'
	import Cookie from 'js-cookie'
	import moment from 'moment'
	import { Base64 } from 'js-base64'
	import VueRecaptcha from 'vue-recaptcha'

	export default{
		components: {
			VueRecaptcha
		},
		data () {
			return{
				// data to submit
				about: 'none',
				target: 'none',
				message: '',
				ip: '',
				name: '',
				alias: '',

				department: 'none',
				office: 'none',

				// others
				authState: 1,

				// for login
				login: {
					username: '',
					password: ''
				},
			}
		},
		methods: {
			clientLogin() {
				let me = this
				me.$store.state.isLoading = true
				db.collection('users')
				.where('idnumber', '==', me.login.username)
				.where('password', '==', me.login.password)
				.where('role', '==', 0)
				.where('approved', '==', true)
				.get().then(res => {
					if(!res.empty) { // if matched

						me.$store.state.isAdminLoggedIn = false
						Cookie.remove('admin-token')

						let encoded = jwt.sign({
							user_id: (me.$store.state.isAdminLoggedIn) ? 'superadmin' : res.docs[0].id,
							idnumber: (me.$store.state.isAdminLoggedIn) ? 'superadmin' : res.docs[0].data().idnumber,
							real_name: (me.$store.state.isAdminLoggedIn) ? 'superadmin' : res.docs[0].data().fullname,
							way: (me.$store.state.isAdminLoggedIn) ? 'superadmin' : res.docs[0].data().way,
						}, process.env.VUE_APP_JWT_SECRET, { expiresIn: '24h' })
						Cookie.set('client-token', encoded)
						me.$store.state.isClientLoggedIn = true

						jwt.verify(Cookie.get('client-token'), process.env.VUE_APP_JWT_SECRET, (err, decoded) => {
		                    me.$store.state.decodedClientToken = decoded
			            })
					}else{
						alert('Invalid credentials or Please try again.')
						Cookie.remove('client-token')
						me.$store.state.isClientLoggedIn = false
					}
				}).catch(err => {
					console.log('Error: '+err)
				}).then(() => {
					me.$store.state.isLoading = false
				})
			},
			submitComplaint() {
				let me = this

				// check if alias contains the admin word
				let aliasSTR = me.alias
				aliasSTR = aliasSTR.toLowerCase()
				let aliasCheck = aliasSTR.search('admin')
				if(me.alias != '') {
					if(aliasCheck >= 0) {
						alert('Invalid Alias')
						die()
					}
				}

                if(grecaptcha.getResponse().length < 1){
                    alert('Please verify that you are a human.')
                    die()
                }

				// validate
				me.$validator.validate().then(res => {
					if (res == false) { // if error
						alert('Please fill up all required fields correctly')
					} else {
						me.setLoading(true)

						// saving here
						let userID = me.$store.state.decodedClientToken.user_id
						let way = me.$store.state.decodedClientToken.way
						let realName = me.$store.state.decodedClientToken.real_name
						let idnumber = me.$store.state.decodedClientToken.idnumber
						db.collection('complaints').doc().set({
							way: way,
							about: me.about,
							target: me.target,
							message: me.message,
							user_id: userID,
							showToPublic: true,
							real_name: realName,
							department: me.department,
							office: me.office,
							created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
							updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
							status: 'Pending',
							idnumber: idnumber
						}).then(() => {
							console.log('Success')
							alert('Thank you for submitting your concern.')
						}).catch(err => {
							console.log('Error: '+err)
						}).then(() => {
							me.setLoading(false)
							me.reset()
							me.$validator.reset()
							me.errors.clear()
						})
					}
				}).catch(err => console.log(err))
			},
			reset() {
				let me = this
				$('body select').removeClass('has-errors')
				$('body textarea').removeClass('has-errors')
				me.way = 'none'
				me.about = 'none'
				me.target = 'none'
				me.message = ''
				me.name = ''
			},
			setLoading(val) {
				this.$store.state.isLoading = val
			},
			adminLogout() {
                let me = this
                me.$store.state.isLoading = true
                Cookie.remove('admin-token')
                me.$store.state.isLoading = false
                me.$store.state.isAdminLoggedIn = false
            }
		},
		mounted() {
			let me = this
			me.$parent.onAdminPanel = false
		}
	}

	$('body').on('change', 'select', function() {
		$(this).removeClass('has-errors')
	})
	$('body').on('change', 'input', function() {
		$(this).removeClass('has-errors')
	})
	$('body').on('change', 'textarea', function() {
		$(this).removeClass('has-errors')
	})
</script>
